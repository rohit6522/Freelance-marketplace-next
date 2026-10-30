import Order from "../models/Order.js";
import Review from "../models/Review.js";
import FreelancerProfile from "../models/FreelancerProfile.js";
import { ORDER_STATUS, SELLER_TIERS, TIER_RULES } from "../utils/constants.js";
import { round1 } from "../utils/money.js";
import { toObjectId } from "../utils/toObjectId.js";

export const computeSellerTier = ({ completedOrders = 0, ratingAverage = 0 }) => {
  const rule = TIER_RULES.find(
    (r) => completedOrders >= r.minCompleted && ratingAverage >= r.minRating
  );
  return rule ? rule.tier : SELLER_TIERS.RISING_TALENT;
};

// Freelancer ke completed orders aur ratings ko database se dobara ginta hai (stored copy sync rakhne ke liye)
export const recomputeSellerStats = async (freelancerId, session) => {
  const id = toObjectId(freelancerId);

  const [completedOrders, [ratingRow]] = await Promise.all([
    Order.countDocuments({ freelancer: id, status: ORDER_STATUS.COMPLETED }).session(session || null),
    Review.aggregate([
      { $match: { freelancer: id, isHidden: false } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).session(session || null),
  ]);

  const ratingAverage = ratingRow ? round1(ratingRow.avg) : 0;
  const ratingCount = ratingRow?.count || 0;
  const sellerTier = computeSellerTier({ completedOrders, ratingAverage });

  await FreelancerProfile.updateOne(
    { user: id },
    { $set: { completedOrders, ratingAverage, ratingCount, sellerTier } },
    { session, timestamps: false }
  );

  return { completedOrders, ratingAverage, ratingCount, sellerTier };
};

// Gig cards par tier badge dikhane ke liye (freelancer ka tier profile me stored hai)
export const attachSellerInfo = async (gigs) => {
  const idOf = (g) => String(g.freelancer?._id || g.freelancer);
  const ids = [...new Set(gigs.map(idOf))];

  const profiles = await FreelancerProfile.find({ user: { $in: ids } })
    .select("user title sellerTier")
    .lean();
  const map = new Map(profiles.map((p) => [String(p.user), p]));

  return gigs.map((g) => {
    const p = map.get(idOf(g));
    return {
      ...g,
      seller: {
        title: p?.title || null,
        tier: p?.sellerTier || SELLER_TIERS.RISING_TALENT,
      },
    };
  });
};