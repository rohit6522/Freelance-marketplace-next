import { Router } from "express";
import {
  register, login, logout, getMe, updateMe,
  changePassword, forgotPassword, resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  registerRules, loginRules, forgotPasswordRules,
  resetPasswordRules, changePasswordRules, updateMeRules,
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.post("/logout", logout);
router.post("/forgot-password", authLimiter, forgotPasswordRules, validate, forgotPassword);
router.patch("/reset-password/:token", authLimiter, resetPasswordRules, validate, resetPassword);

router.get("/me", protect, getMe);
router.patch("/me", protect, updateMeRules, validate, updateMe);
router.patch("/change-password", protect, authLimiter, changePasswordRules, validate, changePassword);

export default router;