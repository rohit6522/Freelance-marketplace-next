import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [
        (arr) => arr.length === 2,
        "A conversation must have exactly 2 participants",
      ],
    },
    participantsKey: { type: String }, // sorted ids, duplicate rokne ke liye
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      sentAt: Date,
    },
  },
  { timestamps: true }
);

conversationSchema.pre("validate", function () {
  if (this.participants?.length === 2) {
    this.participantsKey = this.participants
      .map((id) => id.toString())
      .sort()
      .join("_");
  }
});

// Same pair ke liye ek general chat + har order ke liye ek chat
conversationSchema.index({ participantsKey: 1, order: 1 }, { unique: true });
conversationSchema.index({ participants: 1, updatedAt: -1 });

export default mongoose.model("Conversation", conversationSchema);