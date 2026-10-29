import mongoose from "mongoose";
import crypto from "crypto";
import { GIG_STATUS, PACKAGE_TIERS } from "../utils/constants.js";
import { slugify } from "../utils/slugify.js";
import { imageSchema } from "./sharedSchemas.js";

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    price: {
      type: Number,
      required: true,
      min: [5, "Minimum package price is 5"],
      max: [100000, "Maximum package price is 100000"],
    },
    deliveryDays: { type: Number, required: true, min: 1, max: 90 },
    revisions: { type: Number, default: 0, min: 0, max: 50 },
    unlimitedRevisions: { type: Boolean, default: false },
    features: {
      type: [{ type: String, trim: true, maxlength: 120 }],
      validate: [(arr) => arr.length <= 10, "At most 10 features per package"],
    },
  },
  { _id: false }
);

const gigSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    slug: { type: String, unique: true },
    description: { type: String, trim: true, maxlength: 5000 },
    tags: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      validate: [(arr) => arr.length <= 5, "A gig can have at most 5 tags"],
    },
    images: {
      type: [imageSchema],
      validate: [(arr) => arr.length <= 5, "A gig can have at most 5 images"],
    },
    deliverables: {
      type: [
        {
          title: { type: String, trim: true, maxlength: 80 },
          description: { type: String, trim: true, maxlength: 200 },
          _id: false,
        },
      ],
      validate: [(arr) => arr.length <= 6, "At most 6 deliverables"],
    },
    packages: {
      basic: packageSchema,
      standard: packageSchema,
      premium: packageSchema,
    },
    faqs: {
      type: [
        {
          question: { type: String, required: true, trim: true, maxlength: 200 },
          answer: { type: String, required: true, trim: true, maxlength: 800 },
          _id: false,
        },
      ],
      validate: [(arr) => arr.length <= 10, "At most 10 FAQs"],
    },
    status: {
      type: String,
      enum: Object.values(GIG_STATUS),
      default: GIG_STATUS.DRAFT,
    },

    // Filter/sort ke liye. Packages se automatically calculate hote hain.
    startingPrice: { type: Number, default: 0 },
    minDeliveryDays: { type: Number, default: 0 },

    // Review service (Step 6) ye update karti hai
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

gigSchema.pre("validate", function () {
  // Slug sirf creation par set hota hai (links na toote)
  if (this.isNew && !this.slug) {
    this.slug = `${slugify(this.title)}-${crypto.randomBytes(3).toString("hex")}`;
  }

  // Publish karne ke liye sab required
  if (this.status === GIG_STATUS.PUBLISHED) {
    if (!this.description || this.description.length < 50) {
      this.invalidate(
        "description",
        "Description must be at least 50 characters to publish"
      );
    }
    if (!this.images || this.images.length < 1) {
      this.invalidate("images", "At least one image is required to publish");
    }
    for (const tier of PACKAGE_TIERS) {
      if (!this.packages?.[tier]) {
        this.invalidate(`packages.${tier}`, `${tier} package is required to publish`);
      }
    }
  }

  // Starting price aur minimum delivery packages se nikalo
  const tiers = PACKAGE_TIERS.map((t) => this.packages?.[t]).filter(Boolean);
  this.startingPrice = tiers.length ? Math.min(...tiers.map((p) => p.price)) : 0;
  this.minDeliveryDays = tiers.length
    ? Math.min(...tiers.map((p) => p.deliveryDays))
    : 0;
});

gigSchema.index(
  { title: "text", description: "text", tags: "text" },
  { weights: { title: 10, tags: 5, description: 1 } }
);
gigSchema.index({ status: 1, category: 1, startingPrice: 1 });
gigSchema.index({ freelancer: 1, status: 1 });
gigSchema.index({ ratingAverage: -1 });
gigSchema.index({ createdAt: -1 });

export default mongoose.model("Gig", gigSchema);