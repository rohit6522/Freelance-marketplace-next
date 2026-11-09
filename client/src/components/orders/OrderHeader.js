"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import { STATUS_META, formatIso, statusLabel } from "@/lib/orders";
import { cn, formatMoney, round } from "@/lib/utils";

const PAYMENT_TEXT = {
  held: "Held in demo escrow",
  released: "Fully released",
  refunded: "Refunded to client",
  pending: "Payment pending",
  failed: "Payment failed",
};

export default function OrderHeader({ order, payment, role }) {
  const [expanded, setExpanded] = useState(false);
  const done = order.milestones.filter((m) => m.status === "completed").length;
  const total = order.milestones.length;

  const chipText =
    order.status === "in_progress"
      ? done >= total
        ? "All Milestones Complete"
        : `Milestone ${done + 1} of ${total} In Flight`
      : statusLabel(order.status, role);

  const pkg = order.selectedPackage;
  const revisionsText = pkg.unlimitedRevisions ? "Unlimited" : `${order.revisionsUsed}/${pkg.revisions}`;
  const remaining = payment ? round(payment.amount - payment.releasedAmount - payment.refundedAmount) : 0;
  const longRequirements = (order.requirements ?? "").length > 220;

  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-md flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="font-code-sm text-code-sm px-space-xs py-0.5 bg-surface-container font-bold text-on-surface">
            ID: {order.orderNumber}
          </span>
          <span
            className={cn(
              "font-label-sm text-label-sm px-space-xs py-0.5 uppercase tracking-wider font-semibold",
              STATUS_META[order.status]?.chip
            )}
          >
            {chipText}
          </span>
        </div>
        <span className="font-code-sm text-code-sm text-on-surface-variant">INITIATED: {formatIso(order.createdAt)}</span>
      </div>

      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{order.gig?.title}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-space-xs font-code-sm text-code-sm text-on-surface-variant">
          <span className="bg-surface-container px-space-xs py-0.5 uppercase">{pkg.tier} package</span>
          <span>{pkg.deliveryDays} DAYS</span>
          <span>•</span>
          <span>REVISIONS {revisionsText}</span>
          {order.gig?.slug && (
            <>
              <span>•</span>
              <Link href={`/gigs/${order.gig.slug}`} className="text-primary font-bold hover:underline">
                VIEW GIG
              </Link>
            </>
          )}
        </div>

        <div className="mt-space-sm">
          <span className="font-code-sm text-code-sm uppercase text-on-surface-variant block mb-1">Project requirements</span>
          <p
            className={cn(
              "font-body-md text-body-md text-on-surface-variant whitespace-pre-line",
              !expanded && "line-clamp-3"
            )}
          >
            {order.requirements}
          </p>
          {longRequirements && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 font-label-sm text-label-sm uppercase text-primary font-bold hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm bg-surface-container-low p-space-md">
        <div>
          <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant block mb-1">
            Contractor (Seller)
          </span>
          <div className="flex items-center gap-space-xs">
            <Avatar user={order.freelancer} size="w-8 h-8" shape="square" />
            <div className="min-w-0">
              <Link
                href={`/freelancers/${order.freelancer?._id}`}
                className="font-label-md text-label-md text-on-surface block leading-tight truncate hover:text-primary"
              >
                {order.freelancer?.name}
              </Link>
              <span className="font-code-sm text-code-sm text-on-surface-variant">Seller</span>
            </div>
          </div>
        </div>

        <div>
          <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant block mb-1">
            Client (Buyer)
          </span>
          <div className="flex items-center gap-space-xs">
            <Avatar user={order.client} size="w-8 h-8" shape="square" />
            <div className="min-w-0">
              <span className="font-label-md text-label-md text-on-surface block leading-tight truncate">
                {order.client?.companyName || order.client?.name}
              </span>
              <span className="font-code-sm text-code-sm text-on-surface-variant">Simulated payment</span>
            </div>
          </div>
        </div>

        <div>
          <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant block mb-1">
            Vault Commitment
          </span>
          <div className="font-headline-sm text-headline-sm text-primary font-bold leading-tight">
            {formatMoney(order.amount)} USD
          </div>
          <span className="font-code-sm text-code-sm text-primary uppercase font-bold flex items-center gap-1">
            <Icon name="lock" className="text-body-sm" />
            {PAYMENT_TEXT[payment?.status] ?? "—"}
          </span>
          {payment?.status === "held" && (
            <span className="font-code-sm text-code-sm text-on-surface-variant block">
              Released {formatMoney(payment.releasedAmount)} · Remaining {formatMoney(remaining)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}