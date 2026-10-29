import Payment from "../models/Payment.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ROLES } from "../utils/constants.js";
import { round2 } from "../utils/money.js";
import { getPagination, buildMeta } from "../utils/pagination.js";

const partyField = (user) => (user.role === ROLES.FREELANCER ? "payee" : "payer");

// GET /api/payments   (meri transactions: freelancer ke liye received, client ke liye paid)
export const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const isFreelancer = req.user.role === ROLES.FREELANCER;

  const filter = { [partyField(req.user)]: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("order", "orderNumber status")
      .populate(isFreelancer ? "payer" : "payee", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  res.json({ success: true, data: { payments, pagination: buildMeta(total, page, limit) } });
});

// GET /api/payments/summary   (earnings/spending ka total, dashboards me kaam aayega)
export const getSummary = asyncHandler(async (req, res) => {
  const [row] = await Payment.aggregate([
    { $match: { [partyField(req.user)]: req.user._id } },
    {
      $group: {
        _id: null,
        released: { $sum: "$releasedAmount" },
        refunded: { $sum: "$refundedAmount" },
        inEscrow: {
          $sum: {
            $cond: [{ $eq: ["$status", "held"] }, { $subtract: ["$amount", "$releasedAmount"] }, 0],
          },
        },
        transactions: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      role: req.user.role,
      released: round2(row?.released || 0), // freelancer ke liye earned, client ke liye paid
      inEscrow: round2(row?.inEscrow || 0),
      refunded: round2(row?.refunded || 0),
      transactions: row?.transactions || 0,
      isSimulated: true,
    },
  });
});