import mongoose from "mongoose";

export const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String }, // Cloudinary delete ke liye
  },
  { _id: false }
);

export const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    publicId: { type: String },
    size: { type: Number, min: 0 }, // bytes
    mimeType: { type: String },
  },
  { _id: false }
);