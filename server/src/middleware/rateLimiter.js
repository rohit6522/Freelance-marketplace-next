import rateLimit from "express-rate-limit";

// Login, register, password routes par brute-force rokne ke liye
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in 15 minutes.",
    details: null,
  },
});