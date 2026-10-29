import jwt from "jsonwebtoken";

export const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

// rememberMe false ho to session cookie banti hai (browser band hote hi chali jaati hai)
export const sendTokenCookie = (res, userId, rememberMe = true) => {
  const options = baseCookieOptions();
  if (rememberMe) {
    const days = Number(process.env.COOKIE_EXPIRES_DAYS) || 7;
    options.maxAge = days * 24 * 60 * 60 * 1000;
  }
  res.cookie("token", signToken(userId), options);
};

export const clearTokenCookie = (res) => {
  res.clearCookie("token", baseCookieOptions());
};