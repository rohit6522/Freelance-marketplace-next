import Icon from "@/components/ui/Icon";
import { STATUS_FILTERS } from "@/lib/orders";
import { cn } from "@/lib/utils";

export default function OrderFilters({ filters, counts, qInput, onQInput, onStatus, onExport, exporting }) {
  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-code-sm text-code-sm uppercase tracking-widest text-primary font-bold">
              SYSTEM // CONTRACT OPS
            </span>
            <span className="w-1.5 h-1.5 bg-primary" />
            <span className="font-code-sm text-code-sm text-on-surface-variant">DEMO ESCROW (SIMULATED)</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
            Order Management &amp; Active Deliveries
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
            Track milestones, deliveries, approvals and simulated escrow releases for every order.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center bg-surface-container-low px-space-sm py-2 w-full sm:w-64">
            <Icon name="search" className="text-outline text-body-md mr-1" />
            <input
              type="text"
              value={qInput}
              onChange={(e) => onQInput(e.target.value)}
              maxLength={100}
              aria-label="Filter orders by number or title"
              placeholder="Filter order number or title..."
              className="bg-transparent text-on-surface placeholder:text-outline-variant font-body-sm text-body-sm focus:outline-none w-full"
            />
          </div>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm px-space-md py-2.5 flex items-center gap-space-xs transition-colors uppercase disabled:opacity-75"
          >
            <Icon name={exporting ? "sync" : "file_download"} className={cn("text-body-md", exporting && "animate-spin")} />
            {exporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-space-xs overflow-x-auto bg-surface-container-lowest p-space-xs shadow-sm no-scrollbar">
        {STATUS_FILTERS.map((item) => {
          const active = filters.status === item.value;
          const count = counts ? (item.value === "" ? counts.all : counts[item.value]) : null;
          return (
            <button
              key={item.value || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onStatus(item.value)}
              className={cn(
                "px-space-md py-2 font-label-sm text-label-sm uppercase transition-colors whitespace-nowrap",
                active
                  ? "bg-on-surface text-surface-container-lowest"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container"
              )}
            >
              {item.label}
              {count !== null ? ` (${count ?? 0})` : ""}
            </button>
          );
        })}
      </div>
    </>
  );
}