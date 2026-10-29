import mongoose from "mongoose";
import crypto from "crypto";
import { ORDER_STATUS, PACKAGE_TIERS } from "../utils/constants.js";
import { fileSchema } from "./sharedSchemas.js";

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 300 },
  amount: { type: Number, required: true, min: 0 },
  dueDate: Date,
  status: {
    type: String,
    enum: ["upcoming", "current", "completed"],
    default: "upcoming",
  },
  completedAt: Date,
  releasedAt: Date, // simulated escrow se release hone ka time
});

const deliverySchema = new mongoose.Schema({
  message: { type: String, trim: true, maxlength: 2000 },
  files: [fileSchema],
  deliveredAt: { type: Date, default: Date.now },
});

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: { type: String, trim: true, maxlength: 300 },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Order ke time package ki copy, taaki baad me gig edit ho to purana order na badle
    selectedPackage: {
      tier: { type: String, enum: PACKAGE_TIERS, required: true },
      name: { type: String, required: true },
      deliveryDays: { type: Number, required: true },
      revisions: { type: Number, default: 0 },
      unlimitedRevisions: { type: Boolean, default: false },
      features: [String],
    },
    amount: { type: Number, required: true, min: 0 }, // hamesha server calculate karega
    requirements: {
      type: String,
      required: [true, "Project requirements are required"],
      trim: true,
      minlength: [10, "Requirements must be at least 10 characters"],
      maxlength: 3000,
    },
    requirementFiles: [fileSchema],

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    statusHistory: [statusHistorySchema],
    milestones: [milestoneSchema],
    deliveries: [deliverySchema],

    revisionsUsed: { type: Number, default: 0, min: 0 },
    revisionRequests: [
      {
        message: { type: String, required: true, trim: true, maxlength: 1000 },
        requestedAt: { type: Date, default: Date.now },
      },
    ],

    startedAt: Date,
    dueDate: Date,
    deliveredAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelReason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

orderSchema.pre("validate", function () {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = `GC-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  }
  if (this.client && this.freelancer && this.client.equals(this.freelancer)) {
    this.invalidate("client", "You cannot order your own gig");
  }
});

orderSchema.index({ client: 1, status: 1, createdAt: -1 });
orderSchema.index({ freelancer: 1, status: 1, createdAt: -1 });
orderSchema.index({ gig: 1 });

export default mongoose.model("Order", orderSchema);