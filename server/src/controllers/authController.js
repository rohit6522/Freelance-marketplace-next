import crypto from "crypto";
import User from "../models/User.js";
import FreelancerProfile from "../models/FreelancerProfile.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ROLES } from "../utils/constants.js";
import { sendTokenCookie, clearTokenCookie } from "../utils/token.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  // Sirf allowed fields lete hain (role "admin" jaisi cheez bheji bhi jaye to nahi chalegi)
  const { name, email, password, role, companyName, country } = req.body;

  const user = await User.create({ name, email, password, role, companyName, country });

  if (user.role === ROLES.FREELANCER) {
    await FreelancerProfile.create({ user: user._id });
  }

  sendTokenCookie(res, user._id, true);
  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { user },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe = true } = req.body;

  const user = await User.findOne({ email }).select("+password");
  const passwordOk = user && (await user.comparePassword(password));

  // Email ya password galat, dono me same message (attacker ko hint nahi milta)
  if (!passwordOk) throw new ApiError(401, "Invalid email or password");
  if (!user.isActive) throw new ApiError(403, "This account has been deactivated");

  sendTokenCookie(res, user._id, rememberMe);
  res.json({ success: true, message: "Logged in successfully", data: { user } });
});

// POST /api/auth/logout
export const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: "Logged out successfully" });
};

// GET /api/auth/me  (page refresh par frontend yahi call karega)
export const getMe = asyncHandler(async (req, res) => {
  let freelancerProfile = null;

  if (req.user.role === ROLES.FREELANCER) {
    freelancerProfile = await FreelancerProfile.findOne({ user: req.user._id });
    if (!freelancerProfile) {
      freelancerProfile = await FreelancerProfile.create({ user: req.user._id });
    }
  }

  res.json({ success: true, data: { user: req.user, freelancerProfile } });
});

// PATCH /api/auth/me  (account settings)
export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "country", "companyName"];
  for (const field of allowed) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }
  await req.user.save();

  res.json({ success: true, message: "Profile updated", data: { user: req.user } });
});

// PATCH /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  sendTokenCookie(res, user._id, true); // naya token, purane token ab invalid
  res.json({ success: true, message: "Password changed successfully" });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  let devResetUrl;

  if (user && user.isActive) {
    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    try {
      await sendPasswordResetEmail(user, resetUrl);
      if (process.env.NODE_ENV === "development") devResetUrl = resetUrl;
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(500, "Could not send reset email. Please try again later");
    }
  }

  // Email exist kare ya na kare, response same (kisi ka email guess nahi kar sakte)
  res.json({
    success: true,
    message: "If an account with that email exists, a reset link has been sent",
    ...(devResetUrl ? { devResetUrl } : {}), // sirf development me, testing ke liye
  });
});

// PATCH /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  });
  if (!user) throw new ApiError(400, "Reset link is invalid or has expired");

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenCookie(res, user._id, true);
  res.json({ success: true, message: "Password reset successfully", data: { user } });
});