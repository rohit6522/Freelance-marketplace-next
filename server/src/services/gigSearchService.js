import Gig from "../models/Gig.js";
import Category from "../models/Category.js";
import FreelancerProfile from "../models/FreelancerProfile.js";
import { GIG_STATUS } from "../utils/constants.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { getPagination, buildMeta } from "../utils/pagination.js";

const isObjectId = (value) => /^[a-f\d]{24}$/i.test(value);

const buildSort = (sort, hasText) => {
  switch (sort) {
    case "newest":
      return { createdAt: -1, _id: -1 };
    case "price_asc":
      return { startingPrice: 1, _id: 1 };
    case "price_desc":
      return { startingPrice: -1, _id: 1 };
    case "rating":
      return { ratingAverage: -1, ratingCount: -1, _id: 1 };
    default: // relevance
      return hasText
        ? { score: { $meta: "textScore" }, ratingAverage: -1, _id: 1 }
        : { ratingAverage: -1, ratingCount: -1, createdAt: -1, _id: 1 };
  }
};

export const searchGigs = async (params = {}) => {
  const { q, category, tags, minPrice, maxPrice, rating, delivery, experience, sort = "relevance" } = params;
  const { page, limit, skip } = getPagination(params);
  const empty = { gigs: [], pagination: buildMeta(0, page, limit) };

  const filter = { status: GIG_STATUS.PUBLISHED };

  if (q) filter.$text = { $search: q };

  if (category) {
    const match = isObjectId(category) ? { _id: category } : { slug: category.toLowerCase() };
    const found = await Category.findOne({ ...match, isActive: true }).select("_id");
    if (!found) return empty;
    filter.category = found._id;
  }

  if (tags) {
    const list = tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 10);
    if (list.length) {
      filter.tags = { $in: list.map((t) => new RegExp(`^${escapeRegex(t)}$`, "i")) };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.startingPrice = {};
    if (minPrice !== undefined) filter.startingPrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.startingPrice.$lte = maxPrice;
  }

  if (rating !== undefined) filter.ratingAverage = { $gte: rating };

  // "Up to N days": gig ka sabse tez package N din ke andar ho
  if (delivery !== undefined) filter.minDeliveryDays = { $lte: delivery };

  // Freelancer experience profile me hai, isliye pehle matching freelancers nikalte hain
  if (experience !== undefined) {
    const ids = await FreelancerProfile.distinct("user", { experienceYears: { $gte: experience } });
    filter.freelancer = { $in: ids };
  }

  const [gigs, total] = await Promise.all([
    Gig.find(filter)
      .select("-description -faqs -deliverables")
      .populate("freelancer", "name avatar country")
      .populate("category", "name slug")
      .sort(buildSort(sort, Boolean(q)))
      .skip(skip)
      .limit(limit)
      .lean(),
    Gig.countDocuments(filter),
  ]);

  return { gigs, pagination: buildMeta(total, page, limit) };
};