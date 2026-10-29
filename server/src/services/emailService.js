export const sendPasswordResetEmail = async (user, resetUrl) => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Email provider is not configured");
  }
  console.log(`\n[DEV EMAIL] Password reset for ${user.email}\n${resetUrl}\n`);
};