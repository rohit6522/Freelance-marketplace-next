import Payment from "../models/Payment.js";
import ApiError from "../utils/ApiError.js";
import { PAYMENT_STATUS, ROLES } from "../utils/constants.js";
import { round2 } from "../utils/money.js";

export const getPayment = async (orderId, session) => {
  const payment = await Payment.findOne({ order: orderId }).session(session || null);
  if (!payment) throw new ApiError(500, "Payment record not found for this order");
  return payment;
};

// Order ke saath dikhane ke liye (escrow vault card)
export const getPaymentForOrder = (orderId) =>
  Payment.findOne({ order: orderId }).select(
    "amount releasedAmount refundedAmount currency status provider isSimulated transactionId paidAt releasedAt refundedAt"
  );

// SIMULATED checkout: koi asli paisa nahi katta.
// Real gateway (Stripe/Razorpay) lagane par yahan charge karo, success par hi record banao.
// Amount hamesha order se aata hai (jo server ne gig ke package se nikala), client se kabhi nahi.
export const createSimulatedPayment = async (order, session) => {
  const [payment] = await Payment.create(
    [
      {
        order: order._id,
        payer: order.client,
        payee: order.freelancer,
        amount: order.amount,
        status: PAYMENT_STATUS.HELD, // demo escrow me "held"
        paidAt: new Date(),
      },
    ],
    { session }
  );
  return payment;
};

// Ek milestone ka paisa freelancer ko release (simulated)
export const releaseFunds = async (orderId, amount, session) => {
  if (!(amount > 0)) throw new ApiError(400, "Release amount must be greater than 0");

  const payment = await getPayment(orderId, session);
  if (payment.status !== PAYMENT_STATUS.HELD) {
    throw new ApiError(409, "No held funds are available for this order");
  }

  const remaining = round2(payment.amount - payment.releasedAmount);
  if (amount > remaining + 0.001) {
    throw new ApiError(409, "Release amount exceeds the funds still held");
  }

  payment.releasedAmount = round2(payment.releasedAmount + amount);
  if (payment.releasedAmount >= payment.amount) {
    payment.status = PAYMENT_STATUS.RELEASED;
    payment.releasedAt = new Date();
  }
  await payment.save({ session });
  return payment;
};

// Order complete hone par bacha hua sab paisa release
export const releaseRemaining = async (orderId, session) => {
  const payment = await getPayment(orderId, session);
  if (payment.status !== PAYMENT_STATUS.HELD) return payment; // pehle hi release ho chuka

  payment.releasedAmount = payment.amount;
  payment.status = PAYMENT_STATUS.RELEASED;
  payment.releasedAt = new Date();
  await payment.save({ session });
  return payment;
};

// Order cancel hone par jo paisa release nahi hua, wo client ko wapas
export const refundRemaining = async (orderId, session) => {
  const payment = await getPayment(orderId, session);
  if (payment.status !== PAYMENT_STATUS.HELD) return payment;

  payment.refundedAmount = round2(payment.amount - payment.releasedAmount);
  payment.status = PAYMENT_STATUS.REFUNDED;
  payment.refundedAt = new Date();
  await payment.save({ session });
  return payment;
};

// Freelancer ke liye earned/in escrow, client ke liye paid/in escrow
export const getPaymentSummary = async (user) => {
  const field = user.role === ROLES.FREELANCER ? "payee" : "payer";

  const [row] = await Payment.aggregate([
    { $match: { [field]: user._id } },
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

  return {
    role: user.role,
    released: round2(row?.released || 0),
    inEscrow: round2(row?.inEscrow || 0),
    refunded: round2(row?.refunded || 0),
    transactions: row?.transactions || 0,
    isSimulated: true,
  };
};