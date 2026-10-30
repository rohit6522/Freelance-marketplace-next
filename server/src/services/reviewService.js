import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Gig from "../models/Gig.js";
import ApiError from "../utils/ApiError.js";
import { ORDER_STATUS, ROLES } from "../utils/constants.js";
import { runInTransaction } from "../utils/transaction.js";
import { round1 } from "../utils/money.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { toObjectId } from "../utils/toObjectId.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { recomputeSellerStats } from "./sellerService.js";

export const recomputeGigRating = async (gigId, session) => {
  const [row] = await Review.aggregate([
    { $match: { gig: toObjectId(gigId), isHidden: false } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]).session(session || null);

  await Gig.updateOne(
    { _id: gigId },
    { $set: { ratingAverage: row ? round1(row.avg) : 0, ratingCount: row?.count || 0 } },
    { session, timestamps: false } // rating badalne se gig ka updatedAt na badle
  );
};

/* ------------------------------ CREATE ------------------------------ */

export const createReview = (user, { orderId, rating, comment }) =>
  runInTransaction(async (session) => {
    // Sirf us order ka client review de sakta hai
    const order = await Order.findOne({ _id: orderId, client: user._id }).session(session);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.status !== ORDER_STATUS.COMPLETED) {
      throw new ApiError(409, "You can review an order only after it is completed");
    }
    if (await Review.exists({ order: order._id }).session(session)) {
      throw new ApiError(409, "You have already reviewed this order");
    }

    let review;
    try {
      [review] = await Review.create(
        [{ order: order._id, gig: order.gig, client: user._id, freelancer: order.freelancer, rating, comment }],
        { session }
      );
    } catch (err) {
      // Do requests ek saath aayein to unique index hi duplicate rokta hai
      if (err.code === 11000) throw new ApiError(409, "You have already reviewed this order");
      throw err;
    }

    await recomputeGigRating(order.gig, session);
    await recomputeSellerStats(order.freelancer, session);
    return review;
  });

/* ------------------------------ READ ------------------------------ */

const SORTS = {
  recent: { createdAt: -1, _id: -1 },
  highest: { rating: -1, createdAt: -1 },
  lowest: { rating: 1, createdAt: -1 },
};

// Public: gig page ya freelancer profile ke reviews, rating distribution ke saath
export const listReviews = async (params = {}) => {
  const { gig, freelancer, rating, q, sort = "recent" } = params;
  const { page, limit, skip } = getPagination(params, { defaultLimit: 10 });

  const base = { isHidden: false };
  if (gig) base.gig = toObjectId(gig);
  if (freelancer) base.freelancer = toObjectId(freelancer);

  const filter = { ...base };
  if (rating) filter.rating = rating;
  if (q) filter.comment = new RegExp(escapeRegex(q), "i");

  const [reviews, total, grouped] = await Promise.all([
    Review.find(filter)
      .select("-reports") // reporters ki info public nahi hoti
      .populate("client", "name avatar country")
      .populate("gig", "title slug")
      .populate("order", "selectedPackage.tier amount completedAt")
      .sort(SORTS[sort] || SORTS.recent)
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
    Review.aggregate([{ $match: base }, { $group: { _id: "$rating", count: { $sum: 1 } } }]),
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0;
  let sum = 0;
  for (const g of grouped) {
    distribution[g._id] = g.count;
    count += g.count;
    sum += g._id * g.count;
  }

  return {
    reviews,
    summary: { average: count ? round1(sum / count) : 0, count, distribution },
    pagination: buildMeta(total, page, limit),
  };
};

// Dashboard "Reviews": client ko apne likhe hue, freelancer ko mile hue
export const listMyReviews = async (user, params = {}) => {
  const { page, limit, skip } = getPagination(params, { defaultLimit: 10 });
  const isFreelancer = user.role === ROLES.FREELANCER;

  const filter = isFreelancer
    ? { freelancer: user._id, isHidden: false }
    : { client: user._id };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .select("-reports")
      .populate(isFreelancer ? "client" : "freelancer", "name avatar")
      .populate("gig", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  return { reviews, pagination: buildMeta(total, page, limit) };
};

// Client ke completed orders jin par abhi review nahi diya
export const getPendingReviews = async (user) => {
  const reviewedOrders = await Review.distinct("order", { client: user._id });

  return Order.find({
    client: user._id,
    status: ORDER_STATUS.COMPLETED,
    _id: { $nin: reviewedOrders },
  })
    .select("orderNumber gig freelancer amount completedAt selectedPackage.tier")
    .populate("gig", "title slug images")
    .populate("freelancer", "name avatar")
    .sort({ completedAt: -1 })
    .limit(20)
    .lean();
};

/* ------------------------- RESPONSE & REPORT ------------------------- */

export const respondToReview = async (user, reviewId, message) => {
  const review = await Review.findOne({ _id: reviewId, freelancer: user._id, isHidden: false });
  if (!review) throw new ApiError(404, "Review not found");

  review.sellerResponse = { message, respondedAt: new Date() };
  await review.save();
  return review;
};

export const reportReview = async (user, reviewId, reason) => {
  const review = await Review.findOne({ _id: reviewId, isHidden: false });
  if (!review) throw new ApiError(404, "Review not found");

  if (review.client.equals(user._id)) {
    throw new ApiError(403, "You cannot report your own review");
  }
  if (review.reports.some((r) => r.reportedBy.equals(user._id))) {
    throw new ApiError(409, "You have already reported this review");
  }

  review.reports.push({ reportedBy: user._id, reason });
  await review.save();
};