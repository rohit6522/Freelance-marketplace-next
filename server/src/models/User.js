import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ROLES } from "../utils/constants.js";
import { imageSchema } from "./sharedSchemas.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // query me by default nahi aayega
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: "Role must be either client or freelancer",
      },
      required: [true, "Role is required"],
    },
    avatar: imageSchema,
    companyName: { type: String, trim: true, maxlength: 100 }, // clients ke liye
    country: { type: String, trim: true, maxlength: 60 },
    isActive: { type: Boolean, default: true },

    passwordChangedAt: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Password hash (bcryptjs, cost 12)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Password change hone ke baad purane JWT invalid karne ke liye
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > jwtIssuedAt;
};

// Raw token user ko email hoga, DB me sirf hash store hota hai
userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  return token;
};

export default mongoose.model("User", userSchema);