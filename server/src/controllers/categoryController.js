import Category from "../models/Category.js";
import Gig from "../models/Gig.js";
import asyncHandler from "../utils/asyncHandler.js";
import { GIG_STATUS } from "../utils/constants.js";

// GET /api/categories  (public, har category ke published gigs ki count ke saath)
export const getCategories = asyncHandler(async (req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    Gig.aggregate([
      { $match: { status: GIG_STATUS.PUBLISHED } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const data = categories.map((c) => ({ ...c, gigCount: countMap.get(String(c._id)) || 0 }));

  res.json({ success: true, data: { categories: data } });
});