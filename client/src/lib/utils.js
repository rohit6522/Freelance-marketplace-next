export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

// "Elena Rostova" -> "Elena R."
export const shortName = (name = "") => {
  const [first = "", ...rest] = name.trim().split(/\s+/);
  const last = rest[rest.length - 1];
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
};

export const capitalize = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatMoney = (n) => usd.format(Number(n) || 0);
export const formatCompactMoney = (n) => usdCompact.format(Number(n) || 0);

// 280 -> "$280", 56.5 -> "$56.50" (cards aur buttons ke liye)
export const formatPrice = (n) => {
  const value = Number(n) || 0;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatMonthYear = (value) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) : "";

export function timeAgo(value) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const units = [
    ["year", 31536000000],
    ["month", 2592000000],
    ["week", 604800000],
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
  ];
  for (const [name, ms] of units) {
    const n = Math.floor(diff / ms);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

// { q: "a", page: "", x: undefined } -> "?q=a" (khaali values hata deta hai)
export const buildQuery = (params = {}) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
  }
  const text = qs.toString();
  return text ? `?${text}` : "";
};

export const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;