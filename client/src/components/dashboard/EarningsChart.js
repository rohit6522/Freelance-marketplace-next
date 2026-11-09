import { formatMoney, formatPrice } from "@/lib/utils";

const monthLabel = (month) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

export default function EarningsChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.amount), 0);

  return (
    <div className="flex items-end gap-space-sm" role="img" aria-label="Earnings for the last 6 months">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="font-code-sm text-[10px] text-on-surface-variant h-4 truncate">
            {d.amount > 0 ? formatPrice(d.amount) : ""}
          </span>
          <div className="h-32 w-full flex items-end">
            <div
              className="w-full bg-primary"
              style={{ height: max > 0 ? `${Math.max(3, (d.amount / max) * 100)}%` : "3px" }}
              title={`${d.month}: ${formatMoney(d.amount)}`}
            />
          </div>
          <span className="font-code-sm text-[10px] text-on-surface-variant uppercase">{monthLabel(d.month)}</span>
        </div>
      ))}
    </div>
  );
}