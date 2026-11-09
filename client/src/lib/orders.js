import { timeAgo } from "@/lib/utils";

export const STATUS_META = {
  pending: { label: "Pending", chip: "bg-surface-container-high text-on-surface" },
  in_progress: { label: "In Progress", chip: "bg-tertiary text-surface-container-lowest" },
  delivered: { label: "Delivered", clientLabel: "Awaiting Review", chip: "bg-secondary-fixed text-on-surface" },
  revision_requested: { label: "Revision", chip: "bg-error-container text-on-error-container" },
  completed: { label: "Completed", chip: "bg-primary-container text-on-primary-container" },
  cancelled: { label: "Cancelled", chip: "bg-surface-dim text-on-surface-variant" },
};

export const STATUS_FILTERS = [
  { value: "", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "delivered", label: "Delivered" },
  { value: "revision_requested", label: "Revision" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const SORT_CHOICES = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "amount_desc", label: "Highest amount" },
];

export const statusLabel = (status, role) => {
  const meta = STATUS_META[status];
  if (!meta) return status;
  return role === "client" && meta.clientLabel ? meta.clientLabel : meta.label;
};

const UTC = { timeZone: "UTC" };

export const formatShortDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", ...UTC }) : "";

// "Oct 20, 14:12"
export const formatDateTime = (value) =>
  value
    ? `${formatShortDate(value)}, ${new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        ...UTC,
      })}`
    : "";

// "2026-10-18 // 14:32:09 UTC"
export const formatIso = (value) => {
  if (!value) return "";
  const iso = new Date(value).toISOString();
  return `${iso.slice(0, 10)} // ${iso.slice(11, 19)} UTC`;
};

const dueText = (due) => {
  if (!due) return "Due date pending";
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
  if (days > 1) return `Due in ${days} days (${formatShortDate(due)})`;
  if (days === 1) return `Due tomorrow (${formatShortDate(due)})`;
  if (days === 0) return "Due today";
  return `Overdue by ${-days} ${-days === 1 ? "day" : "days"}`;
};

// Order card ke neeche-right ki line
export function getListMeta(order) {
  switch (order.status) {
    case "pending":
      return { icon: "hourglass_top", text: `Placed ${formatShortDate(order.createdAt)}` };
    case "in_progress":
      return { icon: "schedule", text: dueText(order.dueDate) };
    case "revision_requested":
      return { icon: "sync_problem", text: "Revision requested" };
    case "delivered":
      return { icon: "inventory_2", text: `Delivered ${timeAgo(order.deliveredAt)}` };
    case "completed":
      return { icon: "check_circle", text: `Closed ${formatShortDate(order.completedAt)}` };
    default:
      return { icon: "cancel", text: `Cancelled ${formatShortDate(order.cancelledAt)}` };
  }
}

export const formatBytes = (n) => {
  if (!n) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = n;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i === 0 || value >= 10 ? 0 : 1)} ${units[i]}`;
};

export const fileIcon = (file) => {
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".zip")) return "folder_zip";
  if (name.endsWith(".pdf")) return "picture_as_pdf";
  if (/\.(jpe?g|png|webp)$/.test(name)) return "image";
  return "description";
};

/* ------------------------------ CSV export ------------------------------ */

// "=" "+" "-" "@" se shuru hone wali values Excel me formula ban sakti hain, isliye ' laga dete hain
const csvCell = (value) => {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function ordersToCsv(orders, role) {
  const header = ["Order", "Gig", role === "client" ? "Seller" : "Client", "Status", "Amount (USD)", "Placed", "Due", "Completed"];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.gig?.title,
    role === "client" ? o.freelancer?.name : o.client?.name,
    o.status,
    o.amount,
    o.createdAt ? new Date(o.createdAt).toISOString() : "",
    o.dueDate ? new Date(o.dueDate).toISOString() : "",
    o.completedAt ? new Date(o.completedAt).toISOString() : "",
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function downloadCsv(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}