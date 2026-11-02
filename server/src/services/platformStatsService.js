import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Gig from "../models/Gig.js";
import Review from "../models/Review.js";
import Category from "../models/Category.js";
import FreelancerProfile from "../models/FreelancerProfile.js";
import { GIG_STATUS, ORDER_STATUS, PAYMENT_STATUS, ROLES } from "../utils/constants.js";
import { round1, round2 } from "../utils/money.js";

const CACHE_MS = 60 * 1000;
const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

let cache = { value: null, expires: 0 };

// Pichhle n mahine (UTC), purane se naya
const lastMonths = (n) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (n - 1 - i), 1));
    return {
      month: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      label: MONTH_NAMES[d.getUTCMonth()],
    };
  });
};

// Quote ke layak review: 5 star, hidden nahi, kam se kam 40 characters
const QUOTE_FILTER = {
  rating: 5,
  isHidden: false,
  $expr: { $gte: [{ $strLenCP: "$comment" }, 40] },
};

const compute = async () => {
  const months = lastMonths(5);
  const since = new Date(`${months[0].month}-01T00:00:00.000Z`);

  const [paymentRows, freelancers, clients, gigs, categories, completedOrders, ratingRows, monthRows, review, top] =
    await Promise.all([
      Payment.aggregate([
        { $match: { status: { $in: [PAYMENT_STATUS.HELD, PAYMENT_STATUS.RELEASED, PAYMENT_STATUS.REFUNDED] } } },
        {
          $group: {
            _id: null,
            released: { $sum: "$releasedAmount" },
            refunded: { $sum: "$refundedAmount" },
            held: {
              $sum: {
                $cond: [
                  { $eq: ["$status", PAYMENT_STATUS.HELD] },
                  { $subtract: ["$amount", "$releasedAmount"] },
                  0,
                ],
              },
            },
          },
        },
      ]),
      User.countDocuments({ role: ROLES.FREELANCER, isActive: true }),
      User.countDocuments({ role: ROLES.CLIENT, isActive: true }),
      Gig.countDocuments({ status: GIG_STATUS.PUBLISHED }),
      Category.countDocuments({ isActive: true }),
      Order.countDocuments({ status: ORDER_STATUS.COMPLETED }),
      Review.aggregate([
        { $match: { isHidden: false } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
      Order.aggregate([
        { $match: { status: ORDER_STATUS.COMPLETED, completedAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$completedAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Review.findOne(QUOTE_FILTER)
        .sort({ createdAt: -1 })
        .populate("client", "name companyName country")
        .lean(),
      FreelancerProfile.findOne({ completedOrders: { $gt: 0 } })
        .sort({ ratingAverage: -1, completedOrders: -1, ratingCount: -1 })
        .populate("user", "name avatar country")
        .lean(),
    ]);

  const pay = paymentRows[0] || { released: 0, refunded: 0, held: 0 };
  const funded = pay.held + pay.released;
  const monthMap = new Map(monthRows.map((r) => [r._id, r.count]));

  // Testimonial: latest 5-star review ka client aur uske completed orders
  let testimonial = null;
  if (review?.client) {
    const clientOrders = await Order.countDocuments({
      client: review.client._id,
      status: ORDER_STATUS.COMPLETED,
    });
    testimonial = {
      rating: review.rating,
      comment: review.comment,
      client: {
        name: review.client.name,
        companyName: review.client.companyName || null,
        country: review.client.country || null,
      },
      clientOrders,
    };
  }

  // Spotlight: sabse achhe rating wala freelancer aur uska ek 5-star review
  let spotlight = null;
  if (top?.user) {
    const quote = await Review.findOne({ ...QUOTE_FILTER, freelancer: top.user._id })
      .sort({ createdAt: -1 })
      .select("comment")
      .lean();

    spotlight = {
      id: top.user._id,
      name: top.user.name,
      avatar: top.user.avatar || null,
      title: top.title || null,
      sellerTier: top.sellerTier,
      ratingAverage: top.ratingAverage,
      completedOrders: top.completedOrders,
      quote: quote?.comment || null,
    };
  }

  return {
    escrow: {
      held: round2(pay.held),
      released: round2(pay.released),
      refunded: round2(pay.refunded),
      volume: round2(funded),
      releasedPercent: funded > 0 ? round1((pay.released / funded) * 100) : 0,
      isSimulated: true,
    },
    marketplace: {
      freelancers,
      clients,
      gigs,
      categories,
      completedOrders,
      averageRating: ratingRows[0] ? round1(ratingRows[0].avg) : 0,
    },
    completedByMonth: months.map((m) => ({ label: m.label, count: monthMap.get(m.month) || 0 })),
    testimonial,
    spotlight,
  };
};

export const getPublicStats = async () => {
  if (cache.value && cache.expires > Date.now()) return cache.value;
  const value = await compute();
  cache = { value, expires: Date.now() + CACHE_MS };
  return value;
};