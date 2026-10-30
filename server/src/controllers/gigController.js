import Gig from "../models/Gig.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Favorite from "../models/Favorite.js";
import FreelancerProfile from "../models/FreelancerProfile.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { GIG_STATUS, ORDER_STATUS, PACKAGE_TIERS } from "../utils/constants.js";
import { searchGigs } from "../services/gigSearchService.js";
import { getFreelancerStats } from "../services/freelancerStatsService.js";

const GIG_FIELDS = ["title", "description", "category", "tags", "images", "deliverables", "faqs"];
const PACKAGE_FIELDS = ["name", "description", "price", "deliveryDays", "revisions", "unlimitedRevisions", "features"];

const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.REVISION_REQUESTED,
];

// Sirf basic/standard/premium aur sirf allowed fields
const pickPackages = (packages = {}) => {
  const out = {};
  for (const tier of PACKAGE_TIERS) {
    if (packages[tier]) out[tier] = pick(packages[tier], PACKAGE_FIELDS);
  }
  return out;
};

const assertCategory = async (categoryId) => {
  const exists = await Category.exists({ _id: categoryId, isActive: true });
  if (!exists) throw new ApiError(400, "Selected category does not exist");
};

const findOwnedGig = async (id, userId) => {
  const gig = await Gig.findOne({ _id: id, freelancer: userId });
  if (!gig) throw new ApiError(404, "Gig not found");
  return gig;
};

// GET /api/gigs   (public search, filters, sort, pagination)
export const listGigs = asyncHandler(async (req, res) => {
  const data = await searchGigs(req.query);
  res.json({ success: true, data });
});

// GET /api/gigs/mine   (freelancer ke apne gigs, order counts ke saath)
export const getMyGigs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { freelancer: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [gigs, total] = await Promise.all([
    Gig.find(filter)
      .select("-description -faqs")
      .populate("category", "name slug")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Gig.countDocuments(filter),
  ]);

  const counts = await Order.aggregate([
    { $match: { gig: { $in: gigs.map((g) => g._id) } } },
    {
      $group: {
        _id: "$gig",
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $in: ["$status", ACTIVE_ORDER_STATUSES] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", ORDER_STATUS.COMPLETED] }, 1, 0] } },
      },
    },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c]));

  const data = gigs.map((g) => {
    const c = countMap.get(String(g._id));
    return { ...g, orders: { total: c?.total || 0, active: c?.active || 0, completed: c?.completed || 0 } };
  });

  res.json({ success: true, data: { gigs: data, pagination: buildMeta(total, page, limit) } });
});

// GET /api/gigs/:idOrSlug   (gig detail page)
export const getGig = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const condition = /^[a-f\d]{24}$/i.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

  const gig = await Gig.findOne(condition)
    .populate("freelancer", "name avatar country createdAt")
    .populate("category", "name slug");
  if (!gig) throw new ApiError(404, "Gig not found");

  const isOwner = req.user && gig.freelancer._id.equals(req.user._id);

  // Draft/paused gig sirf owner dekh sakta hai, baaki ko 404
  if (gig.status !== GIG_STATUS.PUBLISHED && !isOwner) {
    throw new ApiError(404, "Gig not found");
  }

  if (!isOwner && gig.status === GIG_STATUS.PUBLISHED) {
    Gig.updateOne({ _id: gig._id }, { $inc: { views: 1 } }).catch(() => {});
  }
const [profile, stats] = await Promise.all([
  FreelancerProfile.findOne({ user: gig.freelancer._id }).select(
    "title bio skills languages experienceYears location timezone availability ratingAverage ratingCount sellerTier completedOrders"
  ),
  getFreelancerStats(gig.freelancer._id),
]);

  res.json({ success: true, data: { gig, seller: { profile, stats } } });
});

// POST /api/gigs
export const createGig = asyncHandler(async (req, res) => {
  const data = pick(req.body, GIG_FIELDS);
  data.packages = pickPackages(req.body.packages);
  data.status = req.body.status === GIG_STATUS.PUBLISHED ? GIG_STATUS.PUBLISHED : GIG_STATUS.DRAFT;

  await assertCategory(data.category);

  // Publish ke liye saari conditions Gig model ka validation check karta hai
  const gig = await Gig.create({ ...data, freelancer: req.user._id });

  res.status(201).json({
    success: true,
    message: gig.status === GIG_STATUS.PUBLISHED ? "Gig published" : "Gig saved as draft",
    data: { gig },
  });
});

// PATCH /api/gigs/:id
export const updateGig = asyncHandler(async (req, res) => {
  const gig = await findOwnedGig(req.params.id, req.user._id);

  const updates = pick(req.body, GIG_FIELDS);
  if (updates.category) await assertCategory(updates.category);
  gig.set(updates);

  // Package edit karte waqt poora tier object bhejna hai (name, description, price, deliveryDays...)
  const packages = pickPackages(req.body.packages);
  for (const tier of Object.keys(packages)) gig.set(`packages.${tier}`, packages[tier]);

  await gig.save(); // save() se hooks chalte hain (slug, startingPrice, publish checks)
  res.json({ success: true, message: "Gig updated", data: { gig } });
});

// PATCH /api/gigs/:id/status   (publish / pause / draft)
export const updateGigStatus = asyncHandler(async (req, res) => {
  const gig = await findOwnedGig(req.params.id, req.user._id);
  gig.status = req.body.status;
  await gig.save();
  res.json({ success: true, message: `Gig is now ${gig.status}`, data: { gig } });
});

// DELETE /api/gigs/:id
export const deleteGig = asyncHandler(async (req, res) => {
  const gig = await findOwnedGig(req.params.id, req.user._id);

  // Orders aur reviews gig se jude hain, hard delete se unka record toot jayega
  const hasOrders = await Order.exists({ gig: gig._id });
  if (hasOrders) {
    throw new ApiError(409, "This gig has orders and cannot be deleted. Pause it instead.");
  }

  await Favorite.deleteMany({ gig: gig._id });
  await gig.deleteOne();
  res.json({ success: true, message: "Gig deleted" });
});