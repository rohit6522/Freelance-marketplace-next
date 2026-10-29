import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: 60,
    },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, trim: true, maxlength: 300 },
    icon: { type: String, trim: true }, // Material Symbols icon name
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function () {
  if (this.isModified("name")) this.slug = slugify(this.name);
});

export default mongoose.model("Category", categorySchema);