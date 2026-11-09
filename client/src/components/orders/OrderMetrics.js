import Icon from "@/components/ui/Icon";
import { cn, formatMoney } from "@/lib/utils";

function Metric({ label, value, valueClass = "text-on-surface", icon, iconClass, subLabel, subValue, subClass, barClass }) {
  return (
    <div className="bg-surface-container-lowest p-space-md shadow-sm relative flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-code-sm text-code-sm text-on-surface-variant uppercase tracking-wider block">{label}</span>
          <div className={cn("font-headline-lg text-headline-lg mt-1", valueClass)}>{value}</div>
        </div>
        <div className={cn("w-8 h-8 flex items-center justify-center", iconClass)}>
          <Icon name={icon} className="text-body-md" />
        </div>
      </div>
      <div className="mt-space-md pt-space-xs flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{subLabel}</span>
        <span className={cn("font-code-sm text-code-sm font-bold", subClass)}>{subValue}</span>
      </div>
      <div className={cn("absolute bottom-0 left-0 right-0 h-1", barClass)} />
    </div>
  );
}

export default function OrderMetrics({ role, counts, summary }) {
  const c = counts ?? {};
  const n = (value) => (counts ? String(value ?? 0) : "—");
  const money = (value) => (summary ? formatMoney(value) : "—");
  const isClient = role === "client";

  const activeCount = isClient
    ? (c.pending ?? 0) + (c.in_progress ?? 0) + (c.revision_requested ?? 0)
    : (c.in_progress ?? 0) + (c.revision_requested ?? 0);
  const actionNeeded = isClient ? c.delivered ?? 0 : c.pending ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      <Metric
        label="Active Pipeline"
        value={n(activeCount)}
        icon="pending_actions"
        iconClass="bg-tertiary text-on-tertiary"
        subLabel={isClient ? "In Progress" : "New Requests"}
        subValue={n(isClient ? c.in_progress : c.pending)}
        subClass="text-tertiary"
        barClass="bg-tertiary"
      />
      <Metric
        label={isClient ? "Awaiting Review" : "New Requests"}
        value={n(actionNeeded)}
        icon="rate_review"
        iconClass="bg-on-tertiary-fixed text-surface-container-lowest"
        subLabel={isClient ? "Pending Sign-off" : "Awaiting Your Accept"}
        subValue={actionNeeded > 0 ? "ACTION REQ." : "ALL CLEAR"}
        subClass="text-on-tertiary-fixed"
        barClass="bg-on-tertiary-fixed"
      />
      <Metric
        label="Escrow Vault (Demo)"
        value={money(summary?.inEscrow)}
        valueClass="text-primary"
        icon="shield"
        iconClass="bg-primary text-on-primary"
        subLabel={isClient ? "Held For Sellers" : "Held For You"}
        subValue="SIMULATED"
        subClass="text-primary"
        barClass="bg-primary"
      />
      <Metric
        label={isClient ? "Total Released" : "Total Earned"}
        value={money(summary?.released)}
        icon="verified"
        iconClass="bg-secondary text-on-secondary"
        subLabel="Completed Orders"
        subValue={n(c.completed)}
        subClass="text-secondary"
        barClass="bg-secondary"
      />
    </div>
  );
}