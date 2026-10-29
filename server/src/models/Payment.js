import mongoose from "mongoose";
import crypto from "crypto";
import { PAYMENT_STATUS } from "../utils/constants.js";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // ek order = ek payment record
    },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    payee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true, min: 0 }, // server calculate karega
    platformFee: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, min: 0 },
    releasedAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "USD", uppercase: true },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    provider: { type: String, enum: ["simulated"], default: "simulated" },
    isSimulated: { type: Boolean, default: true, immutable: true },
    transactionId: { type: String, unique: true },

    paidAt: Date,
    releasedAt: Date,
    refundedAt: Date,
    failureReason: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

paymentSchema.pre("validate", function () {
  if (this.isNew && !this.transactionId) {
    this.transactionId = `SIM-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
  }
  this.netAmount = Math.max(0, (this.amount || 0) - (this.platformFee || 0));
});

paymentSchema.index({ payer: 1, createdAt: -1 });
paymentSchema.index({ payee: 1, status: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);