export const DEFAULT_REDIRECT = "/dashboard";

export function getSafeRedirect(value, fallback = DEFAULT_REDIRECT) {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || /[\r\n]/.test(value)) return fallback;
  if (value.startsWith("/login") || value.startsWith("/register")) return fallback;
  return value;
}