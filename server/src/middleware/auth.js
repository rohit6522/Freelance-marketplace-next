import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const getToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  // Postman jaise tools ke liye Bearer header bhi chalega
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
};

// Login hona zaroori hai
export const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new ApiError(401, "Please log in to continue");

  const decoded = jwt.verify(token, process.env.JWT_SECRET); // galat token par error handler 401 dega

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, "This account no longer exists or is deactivated");
  }
  if (user.changedPasswordAfter(decoded.iat)) {
    throw new ApiError(401, "Password was changed recently. Please log in again");
  }

  req.user = user;
  next();
});

// Role check: restrictTo("freelancer"), restrictTo("client", "freelancer")
export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }
    next();
  };

  // Login ho to req.user set karta hai, na ho to guest ki tarah aage jaane deta hai.
// Public pages (gig detail) ke liye, jahan owner ko apna draft bhi dikhna chahiye.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
      req.user = user;
    }
  } catch {
    // galat ya expired token: guest maan lo
  }
  next();
});