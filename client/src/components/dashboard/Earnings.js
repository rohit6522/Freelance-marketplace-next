"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import EarningsChart from "./EarningsChart";
import { EmptyState, ErrorPanel, PageHeader, StatCard } from "./DashboardParts";
import { useApiData } from "@/hooks/useApiData";
import * as dashboardService from "@/services/dashboardService";
import * as paymentService from "@/services/paymentService";
import { formatShortDate } from "@/lib/orders";
import { cn, formatMoney } from "@/lib/utils";

const FILTERS = [
  { value: "", label: "All" },
  { value: "held", label: "In Escrow" },
  { value: "released", label: "Released" },
  { value: "refunded", label: "Refunded" },
];

const STATUS = {
  held: { label: "In Escrow", chip: "bg-secondary-fixed text-on-surface" },
  released: { label: "Released", chip: "bg-primary-container text-on-primary-container" },
  refunded: { label: "Refunded", chip: "bg-error-container text-on-error-container" },
  pending: { label: "Pending", chip: "bg-surface-container-high text-on-surface" },
  failed: { label: "Failed", chip: "bg-surface-dim text-on-surface-variant" },
};

export default function Earnings() {
  const [filter, setFilter] = useState({ status: "", page: 1 });

  const summaryFetcher = useCallback(() => paymentService.getSummary(), []);
  const chartFetcher = useCallback(() => dashboardService.freelancer(), []);
  const listFetcher = useCallback(
    () => paymentService.list({ status: filter.status, page: filter.page, limit: 10 }),
    [filter]
  );

  const summary = useApiData(summaryFetcher);
  const chart = useApiData(chartFetcher);
  const list = useApiData(listFetcher);

  const s = summary.data;
  const payments = list.data?.payments ?? [];
  const pagination = list.data?.pagination;

  return (
    <>
      <PageHeader
        eyebrow="DASHBOARD // FREELANCER"
        title="Earnings & Payouts"
        subtitle="Everything here is simulated demo escrow. No real money is paid out."
      />

      {(summary.error || list.error) && (
        <ErrorPanel message={summary.error || list.error} onRetry={() => { summary.reload(); list.reload(); }} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard label="Total Earned" value={s ? formatMoney(s.released) : "—"} icon="payments" highlight hint="RELEASED TO YOU" loading={summary.loading && !s} />
        <StatCard label="In Escrow" value={s ? formatMoney(s.inEscrow) : "—"} icon="shield" hint="HELD FOR YOU" loading={summary.loading && !s} />
        <StatCard label="Refunded" value={s ? formatMoney(s.refunded) : "—"} icon="undo" hint="RETURNED TO CLIENTS" loading={summary.loading && !s} />
        <StatCard label="Transactions" value={s ? String(s.transactions) : "—"} icon="receipt_long" loading={summary.loading && !s} />
      </div>

      <section className="bg-surface-container-lowest shadow-sm p-space-md">
        <div className="flex items-center justify-between mb-space-md">
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Released, Last 6 Months</h2>
          <span className="font-code-sm text-code-sm text-on-surface-variant">SIMULATED</span>
        </div>
        {chart.loading && !chart.data ? (
          <div className="h-44 bg-surface-container-low animate-pulse" />
        ) : (
          <EarningsChart data={chart.data?.earningsByMonth} />
        )}
      </section>

      <section className="bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-md border-b border-outline-variant">
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Payout History</h2>
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar">
            {FILTERS.map((item) => {
              const active = filter.status === item.value;
              return (
                <button
                  key={item.value || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter({ status: item.value, page: 1 })}
                  className={cn(
                    "px-space-md py-1.5 font-label-sm text-label-sm uppercase whitespace-nowrap",
                    active ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {list.data && payments.length === 0 ? (
          <div className="p-space-lg">
            <EmptyState icon="account_balance_wallet" title="No transactions" text="Payments appear here when clients place orders." />
          </div>
        ) : (
          <div className={cn("overflow-x-auto", list.loading && list.data && "opacity-60")}>
            <table className="w-full text-left font-body-sm text-body-sm min-w-[640px]">
              <thead>
                <tr className="bg-surface-container-low font-label-sm text-label-sm uppercase text-on-surface-variant">
                  <th className="p-space-sm">Date</th>
                  <th className="p-space-sm">Order</th>
                  <th className="p-space-sm">Client</th>
                  <th className="p-space-sm text-right">Amount</th>
                  <th className="p-space-sm text-right">Released</th>
                  <th className="p-space-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {payments.map((payment) => {
                  const meta = STATUS[payment.status] ?? STATUS.pending;
                  return (
                    <tr key={payment._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-space-sm font-code-sm text-code-sm whitespace-nowrap">{formatShortDate(payment.paidAt || payment.createdAt)}</td>
                      <td className="p-space-sm">
                        {payment.order ? (
                          <Link href={`/orders?id=${payment.order._id}`} className="font-code-sm text-code-sm text-primary font-bold hover:underline">
                            #{payment.order.orderNumber}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-space-sm text-on-surface">{payment.payer?.name ?? "—"}</td>
                      <td className="p-space-sm text-right font-code-sm text-code-sm font-bold">{formatMoney(payment.amount)}</td>
                      <td className="p-space-sm text-right font-code-sm text-code-sm text-primary font-bold">{formatMoney(payment.releasedAmount)}</td>
                      <td className="p-space-sm">
                        <span className={cn("font-label-sm text-label-sm px-space-xs py-0.5 uppercase font-semibold whitespace-nowrap", meta.chip)}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-space-sm border-t border-outline-variant">
            <button
              type="button"
              disabled={!pagination.hasPrev || list.loading}
              onClick={() => setFilter((f) => ({ ...f, page: f.page - 1 }))}
              className="px-space-md py-1.5 bg-surface-container-low font-label-sm text-label-sm uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container"
            >
              Prev
            </button>
            <span className="font-code-sm text-code-sm text-on-surface-variant">
              PAGE {pagination.page} OF {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNext || list.loading}
              onClick={() => setFilter((f) => ({ ...f, page: f.page + 1 }))}
              className="px-space-md py-1.5 bg-surface-container-low font-label-sm text-label-sm uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </>
  );
}