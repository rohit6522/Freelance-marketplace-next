export const ROLES = { CLIENT: "client", FREELANCER: "freelancer" };

export const GIG_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  PAUSED: "paused",
};

export const PACKAGE_TIERS = ["basic", "standard", "premium"];

export const ORDER_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  DELIVERED: "delivered",
  REVISION_REQUESTED: "revision_requested",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Valid status transitions. Order service (Step 5) isi ko enforce karegi.
// Kaun kaunsa transition kar sakta hai (client ya freelancer), wo bhi Step 5 me.
export const ORDER_TRANSITIONS = {
  pending: ["in_progress", "cancelled"],
  in_progress: ["delivered", "cancelled"],
  delivered: ["completed", "revision_requested"],
  revision_requested: ["delivered", "cancelled"],
  completed: [],
  cancelled: [],
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  HELD: "held", // simulated escrow: paisa hold hai
  RELEASED: "released",
  REFUNDED: "refunded",
  FAILED: "failed",
};