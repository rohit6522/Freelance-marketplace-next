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


// ---- Step 5: order workflow ----

// Kaun sa role kaunsa status transition kar sakta hai
export const TRANSITION_ACTORS = {
  "pending>in_progress": [ROLES.FREELANCER],
  "pending>cancelled": [ROLES.CLIENT, ROLES.FREELANCER],
  "in_progress>delivered": [ROLES.FREELANCER],
  "in_progress>cancelled": [ROLES.FREELANCER],
  "delivered>completed": [ROLES.CLIENT],
  "delivered>revision_requested": [ROLES.CLIENT],
  "revision_requested>delivered": [ROLES.FREELANCER],
  "revision_requested>cancelled": [ROLES.FREELANCER],
};

// Har order ke default milestones (percent ka total 100 hai)
export const DEFAULT_MILESTONES = [
  { title: "Requirements & planning", description: "Requirements reviewed and the work plan agreed", percent: 20 },
  { title: "First draft", description: "First working draft shared for feedback", percent: 30 },
  { title: "Refinement", description: "Feedback applied and the work polished", percent: 30 },
  { title: "Final delivery", description: "Final files and handoff delivered", percent: 20 },
];