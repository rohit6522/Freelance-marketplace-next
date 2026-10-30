import Favorite from "../models/Favorite.js";
import Gig from "../models/Gig.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { GIG_STATUS } from "../utils/constants.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { attachSellerInfo } from "../services/sellerService.js";

// POST /api/favorites/:gigId   (dobara dabane par bhi error nahi, bas saved rehta hai)
export const addFavorite = asyncHandler(async (req, res) => {
  const gig = await Gig.findOne({ _id: req.params.gigId, status: GIG_STATUS.PUBLISHED }).select("_id");
  if (!gig) throw new ApiError(404, "Gig not found");

  try {
    await Favorite.create({ user: req.user._id, gig: gig._id });
  } catch (err) {
    if (err.code !== 11000) throw err; // pehle se saved hai
  }

  res.status(201).json({ success: true, message: "Gig saved", data: { saved: true } });
});

// DELETE /api/favorites/:gigId
export const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, gig: req.params.gigId });
  res.json({ success: true, message: "Removed from saved gigs", data: { saved: false } });
});

// GET /api/favorites/ids   (browse page par heart icons ki state ke liye)
export const getFavoriteIds = asyncHandler(async (req, res) => {
  const ids = await Favorite.distinct("gig", { user: req.user._id });
  res.json({ success: true, data: { gigIds: ids.map(String) } });
});

// GET /api/favorites   (Saved Gigs page)
export const listFavorites = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  // Sirf wahi saved gigs jo abhi published hain
  const [row] = await Favorite.aggregate([
    { $match: { user: req.user._id } },
    { $lookup: { from: Gig.collection.name, localField: "gig", foreignField: "_id", as: "gig" } },
    { $unwind: "$gig" },
    { $match: { "gig.status": GIG_STATUS.PUBLISHED } },
    { $sort: { createdAt: -1, _id: -1 } },
    { $project: { "gig.description": 0, "gig.faqs": 0, "gig.deliverables": 0 } },
    { $facet: { items: [{ $skip: skip }, { $limit: limit }], total: [{ $count: "n" }] } },
  ]);

  const plain = row.items.map((i) => ({ ...i.gig, savedAt: i.createdAt }));
  await Gig.populate(plain, [
    { path: "freelancer", select: "name avatar country" },
    { path: "category", select: "name slug" },
  ]);
  const gigs = await attachSellerInfo(plain);

  res.json({
    success: true,
    data: { gigs, pagination: buildMeta(row.total[0]?.n || 0, page, limit) },
  });
});