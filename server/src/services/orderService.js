import Order from "../models/Order.js";
import Gig from "../models/Gig.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import {
  GIG_STATUS,
  ORDER_STATUS,
  ORDER_TRANSITIONS,
  TRANSITION_ACTORS,
  DEFAULT_MILESTONES,
  ROLES,
} from "../utils/constants.js";
import { runInTransaction } from "../utils/transaction.js";
import { splitAmount } from "../utils/money.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import * as paymentService from "./paymentService.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

const getRole = (order, user) => {
  if (order.client.equals(user._id)) return ROLES.CLIENT;
  if (order.freelancer.equals(user._id)) return ROLES.FREELANCER;
  return null;
};

// Order sirf uske client ya freelancer ko milta hai. Baaki sabko 404.
const loadOrderFor = async (orderId, user, session) => {
  const order = await Order.findById(orderId).session(session || null);
  const role = order ? getRole(order, user) : null;
  if (!role) throw new ApiError(404, "Order not found");
  return { order, role };
};

// Milestones se progress percent nikalta hai (frontend progress bar ke liye)
export const withProgress = (order) => {
  const o = typeof order.toObject === "function" ? order.toObject() : order;
  const total = o.milestones?.length || 0;
  const done = o.milestones?.filter((m) => m.status === "completed").length || 0;
  return { ...o, progress: total ? Math.round((done / total) * 100) : 0 };
};

/* ------------------------------ CREATE ------------------------------ */

export const createOrder = async (client, { gigId, tier, requirements }) => {
  const gig = await Gig.findOne({ _id: gigId, status: GIG_STATUS.PUBLISHED });
  if (!gig) throw new ApiError(404, "Gig not found or not available");
  if (gig.freelancer.equals(client._id)) {
    throw new ApiError(400, "You cannot order your own gig");
  }

  const seller = await User.findOne({ _id: gig.freelancer, isActive: true });
  if (!seller) throw new ApiError(404, "This seller is no longer available");

  const pkg = gig.packages?.[tier];
  if (!pkg) throw new ApiError(400, `This gig has no ${tier} package`);

  // Price hamesha gig ke package se, client ka bheja hua kuch bhi nahi
  const amount = pkg.price;
  const amounts = splitAmount(amount, DEFAULT_MILESTONES.map((m) => m.percent));
  const milestones = DEFAULT_MILESTONES.map((m, i) => ({
    title: m.title,
    description: m.description,
    amount: amounts[i],
    status: "upcoming",
  }));

  return runInTransaction(async (session) => {
    const [order] = await Order.create(
      [
        {
          gig: gig._id,
          client: client._id,
          freelancer: gig.freelancer,
          selectedPackage: {
            tier,
            name: pkg.name,
            deliveryDays: pkg.deliveryDays,
            revisions: pkg.revisions || 0,
            unlimitedRevisions: Boolean(pkg.unlimitedRevisions),
            features: [...(pkg.features || [])],
          },
          amount,
          requirements,
          status: ORDER_STATUS.PENDING,
          statusHistory: [
            { status: ORDER_STATUS.PENDING, changedBy: client._id, note: "Order placed" },
          ],
          milestones,
        },
      ],
      { session }
    );

    await paymentService.createSimulatedPayment(order, session);
    return order;
  });
};

/* -------------------------- STATUS TRANSITIONS -------------------------- */

export const changeStatus = ({ orderId, user, toStatus, payload = {}, allowedFrom }) =>
  runInTransaction(async (session) => {
    const { order, role } = await loadOrderFor(orderId, user, session);
    const from = order.status;

    if (allowedFrom && !allowedFrom.includes(from)) {
      throw new ApiError(409, `This action is not available while the order is ${from.replace("_", " ")}`);
    }
    if (!ORDER_TRANSITIONS[from]?.includes(toStatus)) {
      throw new ApiError(409, `Order cannot move from "${from}" to "${toStatus}"`);
    }
    if (!TRANSITION_ACTORS[`${from}>${toStatus}`]?.includes(role)) {
      throw new ApiError(403, `A ${role} cannot move an order from "${from}" to "${toStatus}"`);
    }

    const now = new Date();

    switch (toStatus) {
      case ORDER_STATUS.IN_PROGRESS: {
        order.startedAt = now;
        order.dueDate = addDays(now, order.selectedPackage.deliveryDays);

        // Milestone due dates: package ki delivery window me paise ke hisaab se failaye
        let cumulative = 0;
        for (const m of order.milestones) {
          cumulative += m.amount;
          m.dueDate = addDays(now, order.selectedPackage.deliveryDays * (cumulative / order.amount));
        }
        if (order.milestones.length) order.milestones[0].status = "current";
        break;
      }

      case ORDER_STATUS.DELIVERED: {
        order.deliveries.push({ message: payload.message, files: payload.files || [], deliveredAt: now });
        // On-time stats ke liye pehli delivery ka time rakhte hain (revision ke baad late nahi ginte)
        if (!order.deliveredAt) order.deliveredAt = now;
        // Final delivery ka matlab: bache hue milestones bhi poore
        for (const m of order.milestones) {
          if (m.status !== "completed") {
            m.status = "completed";
            m.completedAt = now;
          }
        }
        break;
      }

      case ORDER_STATUS.REVISION_REQUESTED: {
        const pkg = order.selectedPackage;
        if (!pkg.unlimitedRevisions && order.revisionsUsed >= pkg.revisions) {
          throw new ApiError(400, "No revisions are left in this package");
        }
        order.revisionsUsed += 1;
        order.revisionRequests.push({ message: payload.message, requestedAt: now });
        break;
      }

      case ORDER_STATUS.COMPLETED: {
        order.completedAt = now;
        await paymentService.releaseRemaining(order._id, session);
        for (const m of order.milestones) {
          if (m.status !== "completed") {
            m.status = "completed";
            m.completedAt = now;
          }
          if (!m.releasedAt) m.releasedAt = now;
        }
        break;
      }

      case ORDER_STATUS.CANCELLED: {
        order.cancelledAt = now;
        order.cancelledBy = user._id;
        order.cancelReason = payload.reason;
        await paymentService.refundRemaining(order._id, session);
        break;
      }
    }

    order.status = toStatus;
    order.statusHistory.push({
      status: toStatus,
      changedBy: user._id,
      note: payload.note,
      changedAt: now,
    });

    await order.save({ session });
    return order;
  });

/* ------------------------------ MILESTONES ------------------------------ */

// Freelancer: current milestone ko complete mark kare (progress update)
export const completeMilestone = ({ orderId, milestoneId, user }) =>
  runInTransaction(async (session) => {
    const { order, role } = await loadOrderFor(orderId, user, session);

    if (role !== ROLES.FREELANCER) {
      throw new ApiError(403, "Only the freelancer can update milestone progress");
    }
    if (order.status !== ORDER_STATUS.IN_PROGRESS) {
      throw new ApiError(409, "Milestones can only be updated while the order is in progress");
    }

    const index = order.milestones.findIndex((m) => m._id.equals(milestoneId));
    if (index === -1) throw new ApiError(404, "Milestone not found");

    const milestone = order.milestones[index];
    if (milestone.status !== "current") {
      throw new ApiError(409, "Only the current milestone can be completed");
    }

    milestone.status = "completed";
    milestone.completedAt = new Date();
    const next = order.milestones[index + 1];
    if (next) next.status = "current";

    await order.save({ session });
    return order;
  });

// Client: completed milestone ka paisa freelancer ko release (simulated)
export const releaseMilestone = ({ orderId, milestoneId, user }) =>
  runInTransaction(async (session) => {
    const { order, role } = await loadOrderFor(orderId, user, session);

    if (role !== ROLES.CLIENT) {
      throw new ApiError(403, "Only the client can release milestone funds");
    }
    const allowed = [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.DELIVERED, ORDER_STATUS.REVISION_REQUESTED];
    if (!allowed.includes(order.status)) {
      throw new ApiError(409, "Funds cannot be released for an order in this status");
    }

    const milestone = order.milestones.find((m) => m._id.equals(milestoneId));
    if (!milestone) throw new ApiError(404, "Milestone not found");
    if (milestone.status !== "completed") {
      throw new ApiError(409, "This milestone is not completed yet");
    }
    if (milestone.releasedAt) {
      throw new ApiError(409, "Funds for this milestone are already released");
    }

    await paymentService.releaseFunds(order._id, milestone.amount, session);
    milestone.releasedAt = new Date();

    await order.save({ session });
    return order;
  });

/* ------------------------------ READ ------------------------------ */

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  amount_desc: { amount: -1, _id: 1 },
};

// Client ko uske orders, freelancer ko uske orders. Role se apne aap decide hota hai.
export const listOrders = async (user, params = {}) => {
  const { page, limit, skip } = getPagination(params, { defaultLimit: 10 });
  const ownerField = user.role === ROLES.FREELANCER ? "freelancer" : "client";
  const base = { [ownerField]: user._id };
  const filter = { ...base };

  if (params.status) filter.status = params.status;

  if (params.q) {
    const rx = new RegExp(escapeRegex(params.q), "i");
    const gigs = await Gig.find({ title: rx }).select("_id").limit(200).lean();
    filter.$or = [{ orderNumber: rx }, { gig: { $in: gigs.map((g) => g._id) } }];
  }

  const [orders, total, grouped] = await Promise.all([
    Order.find(filter)
      .select("-deliveries -statusHistory -revisionRequests -requirements -requirementFiles")
      .populate("gig", "title slug images")
      .populate("client", "name avatar companyName")
      .populate("freelancer", "name avatar")
      .sort(SORTS[params.sort] || SORTS.newest)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
    Order.aggregate([{ $match: base }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  // Tabs ke liye counts (All, In Progress, Delivered, Completed...)
  const counts = Object.fromEntries(Object.values(ORDER_STATUS).map((s) => [s, 0]));
  let all = 0;
  for (const g of grouped) {
    counts[g._id] = g.count;
    all += g.count;
  }

  return {
    orders: orders.map(withProgress),
    pagination: buildMeta(total, page, limit),
    counts: { all, ...counts },
  };
};

export const getOrderDetails = async (orderId, user) => {
  const { order, role } = await loadOrderFor(orderId, user);

  await order.populate([
    { path: "gig", select: "title slug images" },
    { path: "client", select: "name avatar companyName country" },
    { path: "freelancer", select: "name avatar country" },
  ]);

  const payment = await paymentService.getPaymentForOrder(order._id);
  return { order: withProgress(order), payment, viewerRole: role };
};