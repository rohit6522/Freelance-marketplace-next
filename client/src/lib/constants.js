export const ROLES = { CLIENT: "client", FREELANCER: "freelancer" };

// Keys backend ki focusAreas.js se match karti hain
export const FOCUS_OPTIONS = [
  { value: "fullstack", label: "Fullstack Next.js & TypeScript Ecosystem" },
  { value: "smart-contracts", label: "Smart Contracts / Rust / Web3 Protocols" },
  { value: "ui-ux", label: "Figma UI/UX Systems & Frontend Prototyping" },
  { value: "cloud-devops", label: "Cloud Infrastructure, Kubernetes & DevOps" },
  { value: "ai-ml", label: "AI Models, RAG Pipelines & Vector Databases" },
  { value: "security", label: "Smart Contract & Penetration Auditing" },
];

export const DOMAIN_CHIPS = [
  { label: "#Figma UI/UX", value: "ui-ux" },
  { label: "#Next.js & Edge", value: "fullstack" },
  { label: "#Smart Contracts", value: "smart-contracts" },
  { label: "#LLM Architectures", value: "ai-ml" },
];

export const SELLER_TIER_LABELS = {
  rising_talent: "Rising Talent",
  level_2: "Level 2",
  pro_verified: "Pro Verified",
  top_rated: "Top Rated",
};

export const AVAILABILITY_LABELS = {
  available: "Available for new work",
  busy: "Busy, limited availability",
  unavailable: "Not taking new work",
};

export const LANGUAGE_LEVEL_LABELS = {
  native: "Native",
  fluent: "Fluent",
  conversational: "Conversational",
  basic: "Basic",
};