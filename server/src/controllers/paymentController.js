import Payment from "../models/Payment.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ROLES } from "../utils/constants.js";
import { round2 } from "../utils/money.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { getPaymentSummary } from "../services/paymentService.js";


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

// GET /api/payments/summary
export const getSummary = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getPaymentSummary(req.user) });
});