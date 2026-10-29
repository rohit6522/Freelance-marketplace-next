import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ["basic", "conversational", "fluent", "native"],
      default: "conversational",
    },
  },
  { _id: false }
);

const accreditationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  issuer: { type: String, trim: true, maxlength: 120 },
  year: { type: Number, min: 1970, max: 2100 },
  credentialId: { type: String, trim: true, maxlength: 60 },
});

const workHistorySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  location: { type: String, trim: true, maxlength: 120 },
  startYear: { type: Number, required: true, min: 1970, max: 2100 },
  endYear: { type: Number, min: 1970, max: 2100 },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true, maxlength: 600 },
});

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1500, "Bio cannot exceed 1500 characters"],
    },
    skills: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      validate: [(arr) => arr.length <= 20, "You can add at most 20 skills"],
    },
    languages: [languageSchema],
    experienceYears: { type: Number, min: 0, max: 60, default: 0 },
    location: { type: String, trim: true, maxlength: 100 },
    timezone: { type: String, trim: true, maxlength: 40 },
    hourlyRate: { type: Number, min: 0 },
    weeklyHours: { type: Number, min: 1, max: 80, default: 40 },
    availability: {
      type: String,
      enum: ["available", "busy", "unavailable"],
      default: "available",
    },
    accreditations: [accreditationSchema],
    workHistory: [workHistorySchema],

    // Review service (Step 6) isko stored reviews se recalculate karti hai.
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

freelancerProfileSchema.index({ skills: 1 });
freelancerProfileSchema.index({ experienceYears: -1 });
freelancerProfileSchema.index({ ratingAverage: -1 });

export default mongoose.model("FreelancerProfile", freelancerProfileSchema);