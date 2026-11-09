"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import { SORT_CHOICES, STATUS_META, getListMeta, statusLabel } from "@/lib/orders";
import { cn, formatMoney } from "@/lib/utils";

function OrderCard({ order, role, active, onSelect }) {
  const meta = getListMeta(order);
  const other = role === "client" ? order.freelancer : order.client;
  const name = other?.companyName || other?.name;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={() => onSelect(order._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(order._id);
        }
      }}
      className={cn(
        "bg-surface-container-lowest p-space-md cursor-pointer transition-colors relative focus:outline-none focus-visible:outline-2 focus-visible:outline-primary",
        active ? "shadow-md" : "shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-space-sm mb-space-sm">
        <div className="flex flex-wrap items-center gap-space-xs">
          <span
            className={cn(
              "font-code-sm text-code-sm font-bold bg-surface-container px-space-xs py-0.5",
              active ? "text-primary" : "text-on-surface"
            )}
          >
            #{order.orderNumber}
          </span>
          <span
            className={cn(
              "font-label-sm text-label-sm px-space-xs py-0.5 uppercase tracking-wider font-semibold",
              STATUS_META[order.status]?.chip
            )}
          >
            {statusLabel(order.status, role)}
          </span>
        </div>
        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{formatMoney(order.amount)}</span>
      </div>

      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs leading-snug">{order.gig?.title}</h3>

      <div className="flex items-center justify-between gap-space-sm mt-space-md pt-space-sm bg-surface-container-low p-space-xs">
        <div className="flex items-center gap-space-xs min-w-0">
          <Avatar user={other} size="w-6 h-6" shape="square" />
          <span className="font-body-sm text-body-sm text-on-surface font-medium truncate">{name}</span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant shrink-0">
          <Icon name={meta.icon} className="text-body-sm" />
          <span className="font-code-sm text-code-sm font-medium">{meta.text}</span>
        </div>
      </div>

      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", active ? "bg-primary" : "bg-transparent")} />
    </div>
  );
}

export default function OrderList({ orders, pagination, loading, error, role, selectedId, filters, onSelect, onSort, onPage, onRetry }) {
  return (
    <div className="lg:col-span-5 flex flex-col gap-space-sm">
      <div className="flex items-center justify-between px-space-xs">
        <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold">
          Contract Ledger
        </span>
        <label className="flex items-center gap-1 font-code-sm text-code-sm text-on-surface-variant">
          Sorted by:
          <select
            value={filters.sort}
            onChange={(e) => onSort(e.target.value)}
            className="bg-transparent font-bold text-on-surface focus:outline-none cursor-pointer"
          >
            {SORT_CHOICES.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="bg-error-container p-space-md text-on-error-container">
          <p className="font-body-sm text-body-sm mb-space-xs">{error}</p>
          <button type="button" onClick={onRetry} className="font-label-sm text-label-sm uppercase font-bold underline">
            Try again
          </button>
        </div>
      ) : (
        <div className={cn("flex flex-col gap-space-sm", loading && "opacity-60")} aria-busy={loading}>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} role={role} active={order._id === selectedId} onSelect={onSelect} />
          ))}

          {orders.length === 0 && !loading && (
            <div className="bg-surface-container-lowest p-space-lg text-center">
              <Icon name="search_off" className="text-[32px] text-outline mb-space-xs" />
              <p className="font-body-sm text-body-sm text-on-surface-variant">No orders match these filters.</p>
            </div>
          )}

          {orders.length === 0 && loading && (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 bg-surface-container-lowest animate-pulse" />
              ))}
            </>
          )}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-surface-container-lowest p-space-xs shadow-sm">
          <button
            type="button"
            disabled={!pagination.hasPrev || loading}
            onClick={() => onPage(pagination.page - 1)}
            className="px-space-md py-1.5 bg-surface-container-low font-label-sm text-label-sm uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container"
          >
            Prev
          </button>
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            PAGE {pagination.page} OF {pagination.totalPages} ({pagination.total} ORDERS)
          </span>
          <button
            type="button"
            disabled={!pagination.hasNext || loading}
            onClick={() => onPage(pagination.page + 1)}
            className="px-space-md py-1.5 bg-surface-container-low font-label-sm text-label-sm uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}