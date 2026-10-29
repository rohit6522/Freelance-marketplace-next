import mongoose from "mongoose";
import { fileSchema } from "./sharedSchemas.js";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "text";
      },
    },
    type: { type: String, enum: ["text", "system"], default: "text" },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      required: function () {
        return this.type === "system" || !(this.attachments?.length > 0);
      },
    },
    attachments: {
      type: [fileSchema],
      validate: [(arr) => arr.length <= 5, "At most 5 attachments"],
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);