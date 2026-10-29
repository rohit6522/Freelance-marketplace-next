import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
  },
  { timestamps: true }
);

// Ek user ek gig ko ek hi baar save kar sakta hai
favoriteSchema.index({ user: 1, gig: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);