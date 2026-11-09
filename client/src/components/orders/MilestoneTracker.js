"use client";

import { useState } from "react";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import * as orderService from "@/services/orderService";
import { STATUS_META, formatDateTime, formatShortDate, statusLabel } from "@/lib/orders";
import { cn, formatPrice } from "@/lib/utils";

const RELEASABLE = ["in_progress", "delivered", "revision_requested"];

export default function MilestoneTracker({ order, role, onChanged }) {
  const [busy, setBusy] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const act = async (key, fn, successMessage) => {
    setBusy(key);
    try {
      await fn();
      toast.success(successMessage);
      onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  const history = [...(order.statusHistory ?? [])].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));

  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">
          Execution Milestones &amp; Audit Trail
        </h3>
        <span className="font-code-sm text-code-sm text-on-surface-variant">{order.progress}% PROGRESS</span>
      </div>

      <div className="w-full h-2 bg-surface-container-low flex" role="progressbar" aria-valuenow={order.progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-primary" style={{ width: `${order.progress}%` }} />
      </div>

      <div className="flex flex-col gap-space-md mt-space-xs">
        {order.milestones.map((m, index) => {
          const title = `Step ${index + 1}: ${m.title}`;
          const amount = formatPrice(m.amount);

          if (m.status === "completed") {
            const canRelease = role === "client" && !m.releasedAt && RELEASABLE.includes(order.status);
            return (
              <div key={m._id} className="flex items-start gap-space-md">
                <div className="w-7 h-7 bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <Icon name="check" className="text-body-md" />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface uppercase">{title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{m.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-space-xs shrink-0">
                    <span className="font-code-sm text-code-sm text-on-surface-variant">{formatDateTime(m.completedAt)}</span>
                    {m.releasedAt ? (
                      <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-0.5 text-primary font-bold">
                        RELEASED ({amount})
                      </span>
                    ) : canRelease ? (
                      <button
                        type="button"
                        disabled={busy === m._id}
                        onClick={() => act(m._id, () => orderService.releaseMilestone(order._id, m._id), `${amount} released from demo escrow`)}
                        className="font-label-sm text-label-sm bg-primary text-on-primary px-space-sm py-1 uppercase font-bold hover:bg-primary-container disabled:opacity-75"
                      >
                        {busy === m._id ? "Releasing..." : `Release ${amount}`}
                      </button>
                    ) : (
                      <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-0.5 text-tertiary font-bold">
                        AWAITING RELEASE ({amount})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (m.status === "current") {
            const canComplete = role === "freelancer" && order.status === "in_progress";
            return (
              <div key={m._id} className="flex items-start gap-space-md bg-surface-container-low p-space-sm">
                <div className="w-7 h-7 bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                  <span className="w-2.5 h-2.5 bg-surface-container-lowest" />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div>
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <h4 className="font-label-md text-label-md text-on-surface uppercase">{title}</h4>
                      <span className="font-label-sm text-label-sm bg-tertiary text-surface-container-lowest px-space-xs uppercase">
                        Current Sprint
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{m.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-space-xs shrink-0">
                    {m.dueDate && (
                      <span className="font-code-sm text-code-sm text-tertiary font-bold">DUE {formatShortDate(m.dueDate).toUpperCase()}</span>
                    )}
                    <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-0.5 text-on-surface font-bold">
                      ESCROW ({amount})
                    </span>
                    {canComplete && (
                      <button
                        type="button"
                        disabled={busy === m._id}
                        onClick={() => act(m._id, () => orderService.completeMilestone(order._id, m._id), "Milestone marked as complete")}
                        className="font-label-sm text-label-sm bg-tertiary text-surface-container-lowest px-space-sm py-1 uppercase font-bold hover:opacity-90 disabled:opacity-75"
                      >
                        {busy === m._id ? "Saving..." : "Mark Complete"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={m._id} className="flex items-start gap-space-md opacity-70">
              <div className="w-7 h-7 bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0">
                <span className="font-code-sm text-code-sm font-bold">{index + 1}</span>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface uppercase">{title}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{m.description}</p>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  {m.dueDate && (
                    <span className="font-code-sm text-code-sm text-on-surface-variant">DUE {formatShortDate(m.dueDate).toUpperCase()}</span>
                  )}
                  <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-0.5 text-on-surface font-bold">
                    ESCROW ({amount})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status history */}
      <div className="border-t border-outline-variant pt-space-sm">
        <button
          type="button"
          onClick={() => setShowHistory((s) => !s)}
          aria-expanded={showHistory}
          className="flex items-center gap-1 font-label-sm text-label-sm uppercase font-bold text-on-surface-variant hover:text-primary"
        >
          <Icon name={showHistory ? "expand_less" : "expand_more"} className="text-body-md" />
          Status history ({history.length})
        </button>

        {showHistory && (
          <ol className="mt-space-sm space-y-space-xs">
            {history.map((entry, i) => (
              <li key={`${entry.status}-${i}`} className="flex flex-wrap items-center gap-space-sm font-code-sm text-code-sm">
                <span className="text-on-surface-variant">{formatDateTime(entry.changedAt)} UTC</span>
                <span className={cn("px-space-xs py-0.5 uppercase font-semibold", STATUS_META[entry.status]?.chip)}>
                  {statusLabel(entry.status, "freelancer")}
                </span>
                {entry.note && <span className="text-on-surface">{entry.note}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}