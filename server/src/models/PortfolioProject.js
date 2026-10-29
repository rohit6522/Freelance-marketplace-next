import mongoose from "mongoose";
import { imageSchema } from "./sharedSchemas.js";

const portfolioProjectSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxlength: 1000,
    },
    images: {
      type: [imageSchema],
      validate: [(arr) => arr.length <= 6, "At most 6 images per project"],
    },
    externalLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/\S+$/, "Link must start with http:// or https://"],
    },
    category: { type: String, trim: true, maxlength: 60 }, // jaise "Fintech Infra"
    highlightMetric: { type: String, trim: true, maxlength: 80 }, // "+62% onboarding completion"
    deliverables: {
      type: [{ type: String, trim: true, maxlength: 60 }],
      validate: [(arr) => arr.length <= 8, "At most 8 deliverables"],
    },
    duration: { type: String, trim: true, maxlength: 40 }, // "14 weeks sprint"
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

portfolioProjectSchema.index({ freelancer: 1, displayOrder: 1 });

export default mongoose.model("PortfolioProject", portfolioProjectSchema);