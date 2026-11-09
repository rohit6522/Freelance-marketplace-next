import { SELLER_TIER_LABELS } from "@/lib/constants";

export const SORT_OPTIONS = [
  { value: "relevance", label: "Best Match" },
  { value: "rating", label: "Highest Rated (5.0★)" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export const DELIVERY_OPTIONS = [
  { value: "", label: "Anytime" },
  { value: "1", label: "Up to 24 hours (Rush)" },
  { value: "3", label: "Up to 3 days" },
  { value: "7", label: "Up to 7 days" },
];

export const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4.5", label: "4.5 & above" },
  { value: "4", label: "4.0 & above" },
];

export const EXPERIENCE_OPTIONS = [
  { value: "", label: "Any experience" },
  { value: "2", label: "2+ years" },
  { value: "5", label: "5+ years" },
  { value: "8", label: "8+ years" },
];

export const PRICE_PRESETS = [
  { label: "Under $50", min: "", max: "50" },
  { label: "$50 - $150", min: "50", max: "150" },
  { label: "$150 - $500", min: "150", max: "500" },
  { label: "$500+", min: "500", max: "" },
];

export const TIER_VALUES = ["pro_verified", "top_rated", "level_2", "rising_talent"];

const first = (value) => (Array.isArray(value) ? value[0] : value);

// Number ko string me wapas deta hai, galat ya range ke bahar ho to ""
const num = (value, { min = -Infinity, max = Infinity, int = false } = {}) => {
  const raw = first(value);
  if (raw === undefined || raw === null || raw === "") return "";
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) return "";
  return String(int ? Math.trunc(n) : n);
};

const list = (value, allowed) => {
  const raw = first(value);
  if (!raw) return [];
  const items = String(raw).split(",").map((s) => s.trim()).filter(Boolean);
  return [...new Set(allowed ? items.filter((i) => allowed.includes(i)) : items)];
};

// URL ke searchParams ko safe, normalized object me badalta hai
export function parseGigParams(sp = {}) {
  const sort = first(sp.sort);
  return {
    q: String(first(sp.q) ?? "").trim().slice(0, 100),
    categories: list(sp.category)
      .map((s) => s.toLowerCase())
      .filter((s) => /^[a-z0-9-]{1,60}$/.test(s))
      .slice(0, 8),
    tiers: list(sp.tier, TIER_VALUES),
    delivery: num(sp.delivery, { min: 1, max: 90, int: true }),
    experience: num(sp.experience, { min: 0, max: 60, int: true }),
    minPrice: num(sp.minPrice, { min: 0 }),
    maxPrice: num(sp.maxPrice, { min: 0 }),
    rating: num(sp.rating, { min: 0, max: 5 }),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : "relevance",
    page: Math.max(1, Number(num(sp.page, { min: 1, int: true })) || 1),
  };
}

export function toSearchParams(params, overrides = {}) {
  const v = { ...params, ...overrides };
  const out = new URLSearchParams();
  if (v.q) out.set("q", v.q);
  if (v.categories?.length) out.set("category", v.categories.join(","));
  if (v.tiers?.length) out.set("tier", v.tiers.join(","));
  for (const key of ["delivery", "experience", "minPrice", "maxPrice", "rating"]) {
    if (v[key] !== "" && v[key] != null) out.set(key, String(v[key]));
  }
  if (v.sort && v.sort !== "relevance") out.set("sort", v.sort);
  if (v.page > 1) out.set("page", String(v.page));
  return out;
}

export function buildGigsHref(params, overrides) {
  const qs = toSearchParams(params, overrides).toString();
  return qs ? `/gigs?${qs}` : "/gigs";
}

// Backend API ke liye query string (param names URL jaise hi hain)
export function toApiQuery(params, limit = 12) {
  const qs = toSearchParams(params);
  qs.set("limit", String(limit));
  return qs.toString();
}

// Saare filters hatao, sirf sort rehne do
export const clearedParams = (params) => ({
  q: "",
  categories: [],
  tiers: [],
  delivery: "",
  experience: "",
  minPrice: "",
  maxPrice: "",
  rating: "",
  sort: params.sort,
  page: 1,
});

const priceLabel = (min, max) => {
  if (min !== "" && max !== "") return `BUDGET: $${min} - $${max}`;
  if (min !== "") return `BUDGET: $${min}+`;
  return `BUDGET: Up to $${max}`;
};

// "Active Criteria" pills. `remove` wo overrides hain jo is pill ko hata dete hain.
export function getActivePills(params, categoryNames = {}) {
  const pills = [];

  if (params.q) pills.push({ key: "q", label: `SEARCH: ${params.q}`, remove: { q: "" } });

  for (const slug of params.categories) {
    pills.push({
      key: `category-${slug}`,
      label: `CATEGORY: ${categoryNames[slug] ?? slug}`,
      remove: { categories: params.categories.filter((s) => s !== slug) },
    });
  }

  for (const tier of params.tiers) {
    pills.push({
      key: `tier-${tier}`,
      label: `TIER: ${SELLER_TIER_LABELS[tier]}`,
      remove: { tiers: params.tiers.filter((t) => t !== tier) },
    });
  }

  if (params.delivery) {
    pills.push({
      key: "delivery",
      label: params.delivery === "1" ? "DELIVERY: 24h Rush" : `DELIVERY: Up to ${params.delivery} days`,
      remove: { delivery: "" },
    });
  }

  if (params.minPrice !== "" || params.maxPrice !== "") {
    pills.push({ key: "price", label: priceLabel(params.minPrice, params.maxPrice), remove: { minPrice: "", maxPrice: "" } });
  }

  if (params.rating) {
    pills.push({ key: "rating", label: `RATING: ${Number(params.rating).toFixed(1)}★ & Up`, remove: { rating: "" } });
  }

  if (params.experience) {
    pills.push({ key: "experience", label: `EXPERIENCE: ${params.experience}+ yrs`, remove: { experience: "" } });
  }

  return pills;
}

// Pagination ke page numbers: [1, "gap", 4, 5, 6, "gap", 20]
export function getPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const wanted = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items = [];
  wanted.forEach((page, i) => {
    if (i > 0) {
      const gap = page - wanted[i - 1];
      if (gap === 2) items.push(page - 1);
      else if (gap > 2) items.push("gap");
    }
    items.push(page);
  });
  return items;
}