import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // ek order = ek review
    },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [1500, "Review cannot exceed 1500 characters"],
    },
    sellerResponse: {
      message: { type: String, trim: true, maxlength: 800 },
      respondedAt: Date,
    },
    reports: [
      {
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String, required: true, trim: true, maxlength: 300 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isHidden: { type: Boolean, default: false }, // moderation ke liye
  },
  { timestamps: true }
);

reviewSchema.index({ gig: 1, createdAt: -1 });
reviewSchema.index({ freelancer: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);