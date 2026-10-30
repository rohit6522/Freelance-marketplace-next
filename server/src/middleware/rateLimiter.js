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


// Order place karne par limit (double-click aur spam se bachne ke liye)
export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many orders placed. Please try again later.",
    details: null,
  },
});

// Messages spam rokne ke liye
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "You are sending messages too fast. Please slow down.",
    details: null,
  },
});