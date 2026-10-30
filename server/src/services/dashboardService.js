import Order from "../models/Order.js";
import Gig from "../models/Gig.js";
import Review from "../models/Review.js";
import Favorite from "../models/Favorite.js";
import FreelancerProfile from "../models/FreelancerProfile.js";
import { ORDER_STATUS } from "../utils/constants.js";
import { round2 } from "../utils/money.js";
import { listOrders } from "./orderService.js";
import { getPaymentSummary } from "./paymentService.js";
import { getUnreadCount } from "./messageService.js";
import { getFreelancerStats } from "./freelancerStatsService.js";

const S = ORDER_STATUS;
const sum = (counts, statuses) => statuses.reduce((total, s) => total + (counts[s] || 0), 0);

// ["2026-05", "2026-06", ...] pichhle n mahine (UTC)
const lastMonths = (n) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (n - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
};

export const getClientDashboard = async (user) => {
  const [ordersData, payments, savedGigs, reviewsGiven, unreadMessages] = await Promise.all([
    listOrders(user, { limit: 5, sort: "newest" }),
    getPaymentSummary(user),
    Favorite.countDocuments({ user: user._id }),
    Review.countDocuments({ client: user._id }),
    getUnreadCount(user),
  ]);

  const c = ordersData.counts;

  return {
    stats: {
      totalOrders: c.all,
      activeOrders: sum(c, [S.PENDING, S.IN_PROGRESS, S.REVISION_REQUESTED]),
      awaitingReview: c[S.DELIVERED],
      completedOrders: c[S.COMPLETED],
      cancelledOrders: c[S.CANCELLED],
      totalSpent: payments.released,
      inEscrow: payments.inEscrow,
      refunded: payments.refunded,
      savedGigs,
      unreadMessages,
      reviewsGiven,
      reviewsPending: Math.max(0, c[S.COMPLETED] - reviewsGiven),
    },
    recentOrders: ordersData.orders,
    isSimulated: true,
  };
};

export const getFreelancerDashboard = async (user) => {
  const since = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 5, 1));

  const [ordersData, payments, profile, rates, gigGroups, unreadMessages, earningRows, topRows, recentReviews] =
    await Promise.all([
      listOrders(user, { limit: 5, sort: "newest" }),
      getPaymentSummary(user),
      FreelancerProfile.findOne({ user: user._id }).select("ratingAverage ratingCount sellerTier completedOrders").lean(),
      getFreelancerStats(user._id),
      Gig.aggregate([
        { $match: { freelancer: user._id } },
        { $group: { _id: "$status", count: { $sum: 1 }, views: { $sum: "$views" } } },
      ]),
      getUnreadCount(user),
      // Mahine ke hisaab se earnings: jis milestone ka paisa release hua, usi mahine me
      Order.aggregate([
        { $match: { freelancer: user._id } },
        { $unwind: "$milestones" },
        { $match: { "milestones.releasedAt": { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$milestones.releasedAt" } },
            amount: { $sum: "$milestones.amount" },
          },
        },
      ]),
      Order.aggregate([
        { $match: { freelancer: user._id, status: S.COMPLETED } },
        { $group: { _id: "$gig", orders: { $sum: 1 }, revenue: { $sum: "$amount" } } },
        { $sort: { orders: -1, revenue: -1 } },
        { $limit: 5 },
      ]),
      Review.find({ freelancer: user._id, isHidden: false })
        .select("-reports")
        .populate("client", "name avatar")
        .populate("gig", "title slug")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

  const c = ordersData.counts;

  const gigs = { published: 0, draft: 0, paused: 0, totalViews: 0 };
  for (const g of gigGroups) {
    gigs[g._id] = g.count;
    gigs.totalViews += g.views;
  }

  const earningMap = new Map(earningRows.map((r) => [r._id, r.amount]));
  const earningsByMonth = lastMonths(6).map((month) => ({
    month,
    amount: round2(earningMap.get(month) || 0),
  }));

  const topGigDocs = await Gig.find({ _id: { $in: topRows.map((t) => t._id) } })
    .select("title slug images status ratingAverage ratingCount")
    .lean();
  const gigMap = new Map(topGigDocs.map((g) => [String(g._id), g]));
  const topGigs = topRows
    .map((t) => ({ ...gigMap.get(String(t._id)), completedOrders: t.orders, revenue: round2(t.revenue) }))
    .filter((g) => g._id);

  return {
    stats: {
      newOrders: c[S.PENDING],
      activeOrders: sum(c, [S.IN_PROGRESS, S.REVISION_REQUESTED]),
      awaitingClient: c[S.DELIVERED],
      completedOrders: c[S.COMPLETED],
      cancelledOrders: c[S.CANCELLED],
      totalEarned: payments.released,
      inEscrow: payments.inEscrow,
      ratingAverage: profile?.ratingAverage || 0,
      ratingCount: profile?.ratingCount || 0,
      sellerTier: profile?.sellerTier || "rising_talent",
      jobSuccessRate: rates.jobSuccessRate, // null = abhi data nahi
      onTimeDeliveryRate: rates.onTimeDeliveryRate,
      unreadMessages,
      gigs,
    },
    earningsByMonth,
    topGigs,
    recentOrders: ordersData.orders,
    recentReviews,
    isSimulated: true,
  };
};