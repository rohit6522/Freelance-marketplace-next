export const TIERS = ["basic", "standard", "premium"];
export const TIER_TITLES = { basic: "Basic", standard: "Standard", premium: "Premium" };

export const emptyPackage = (name) => ({
  name,
  description: "",
  price: "",
  deliveryDays: "",
  revisions: "",
  unlimitedRevisions: false,
  featuresText: "",
});

export const defaultGigValues = () => ({
  title: "",
  category: "",
  description: "",
  deliverables: [],
  faqs: [],
  basic: emptyPackage("Basic"),
  standard: emptyPackage("Standard"),
  premium: emptyPackage("Premium"),
});

// API se aaya hua gig -> form ki values
export function gigToFormValues(gig) {
  const pkg = (tier) => {
    const p = gig.packages?.[tier];
    if (!p) return emptyPackage(TIER_TITLES[tier]);
    return {
      name: p.name ?? TIER_TITLES[tier],
      description: p.description ?? "",
      price: p.price != null ? String(p.price) : "",
      deliveryDays: p.deliveryDays != null ? String(p.deliveryDays) : "",
      revisions: p.revisions != null ? String(p.revisions) : "",
      unlimitedRevisions: Boolean(p.unlimitedRevisions),
      featuresText: (p.features ?? []).join("\n"),
    };
  };

  return {
    title: gig.title ?? "",
    category: gig.category?._id ?? "",
    description: gig.description ?? "",
    deliverables: (gig.deliverables ?? []).map((d) => ({ title: d.title ?? "", description: d.description ?? "" })),
    faqs: (gig.faqs ?? []).map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" })),
    basic: pkg("basic"),
    standard: pkg("standard"),
    premium: pkg("premium"),
  };
}

const lines = (text) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const isTouched = (p, defaultName) =>
  p.name.trim() !== defaultName ||
  Boolean(p.description.trim() || p.price !== "" || p.deliveryDays !== "" || p.revisions !== "" || p.unlimitedRevisions || p.featuresText.trim());

function buildPackage(tier, p) {
  const errors = [];
  const add = (field, message) => errors.push({ field: `${tier}.${field}`, message: `${TIER_TITLES[tier]}: ${message}` });

  const name = p.name.trim();
  const description = p.description.trim();
  const price = Number(p.price);
  const days = Number(p.deliveryDays);
  const unlimited = Boolean(p.unlimitedRevisions);
  const revisions = unlimited || p.revisions === "" ? 0 : Number(p.revisions);
  const features = lines(p.featuresText);

  if (!name || name.length > 60) add("name", "name is required (up to 60 characters)");
  if (!description || description.length > 300) add("description", "description is required (up to 300 characters)");
  if (p.price === "" || !Number.isFinite(price) || price < 5 || price > 100000) add("price", "price must be between 5 and 100000");
  if (p.deliveryDays === "" || !Number.isInteger(days) || days < 1 || days > 90) add("deliveryDays", "delivery must be 1 to 90 whole days");
  if (!unlimited && (!Number.isInteger(revisions) || revisions < 0 || revisions > 50)) add("revisions", "revisions must be 0 to 50");
  if (features.length > 10) add("featuresText", "at most 10 features");
  if (features.some((f) => f.length > 120)) add("featuresText", "each feature can be up to 120 characters");

  return {
    errors,
    value: { name, description, price, deliveryDays: days, revisions, unlimitedRevisions: unlimited, features },
  };
}

// values + tags + images -> { payload, problems }. Publish ke liye zyada strict.
export function buildGigPayload(values, { tags, images, publish }) {
  const problems = [];

  const title = values.title.trim();
  if (title.length < 10 || title.length > 120) problems.push({ field: "title", message: "Title must be 10 to 120 characters" });
  if (!values.category) problems.push({ field: "category", message: "Please choose a category" });

  const description = values.description.trim();
  if (description.length > 5000) problems.push({ field: "description", message: "Description cannot exceed 5000 characters" });
  if (publish) {
    if (description.length < 50) problems.push({ field: "description", message: "Description must be at least 50 characters to publish" });
    if (images.length < 1) problems.push({ field: null, message: "Add at least one image to publish" });
  }

  const packages = {};
  for (const tier of TIERS) {
    const p = values[tier];
    if (!publish && !isTouched(p, TIER_TITLES[tier])) continue; // draft me khaali package chhod sakte hain
    const built = buildPackage(tier, p);
    if (built.errors.length) problems.push(...built.errors);
    else packages[tier] = built.value;
  }

  const deliverables = [];
  values.deliverables.forEach((row, i) => {
    const t = row.title.trim();
    const d = row.description.trim();
    if (!t && !d) return;
    if (!t || t.length > 80) problems.push({ field: null, message: `Deliverable ${i + 1}: title is required (up to 80 characters)` });
    else if (d.length > 200) problems.push({ field: null, message: `Deliverable ${i + 1}: description is up to 200 characters` });
    else deliverables.push({ title: t, description: d });
  });

  const faqs = [];
  values.faqs.forEach((row, i) => {
    const q = row.question.trim();
    const a = row.answer.trim();
    if (!q && !a) return;
    if (!q || !a) problems.push({ field: null, message: `FAQ ${i + 1}: add both a question and an answer` });
    else if (q.length > 200 || a.length > 800) problems.push({ field: null, message: `FAQ ${i + 1}: question up to 200, answer up to 800 characters` });
    else faqs.push({ question: q, answer: a });
  });

  const payload = {
    title,
    category: values.category,
    description,
    tags,
    images: images.map(({ url, publicId }) => (publicId ? { url, publicId } : { url })),
    deliverables,
    faqs,
    packages,
  };

  return { payload, problems };
}