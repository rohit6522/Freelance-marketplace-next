"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { ConfirmDialog, DeliverDialog, ReviewDialog } from "./OrderDialogs";
import * as orderService from "@/services/orderService";
import * as reviewService from "@/services/reviewService";
import { formatDateTime } from "@/lib/orders";
import { cn, formatPrice, round } from "@/lib/utils";

const neutralBtn =
  "bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm px-space-md py-2 uppercase transition-colors flex items-center gap-1";
const dangerBtn =
  "bg-surface-container-low hover:bg-error hover:text-on-error text-on-surface font-label-sm text-label-sm px-space-md py-2 uppercase transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed";
const primaryBtn =
  "bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm px-space-md py-2 uppercase transition-colors flex items-center gap-1 font-bold";

export default function OrderActions({ order, payment, role, onChanged }) {
  const [dialog, setDialog] = useState(null);
  const [reviewState, setReviewState] = useState("unknown"); // unknown | pending | done
  const close = () => setDialog(null);

  const isClient = role === "client";
  const isFreelancer = role === "freelancer";
  const status = order.status;
  const pkg = order.selectedPackage;

  const remaining = payment ? round(payment.amount - payment.releasedAmount - payment.refundedAmount) : 0;
  const revisionsLeft = pkg.unlimitedRevisions || order.revisionsUsed < pkg.revisions;
  const lastRevision = order.revisionRequests?.[order.revisionRequests.length - 1];

  // Completed order par client ko review baaki hai ya nahi
  useEffect(() => {
    if (!isClient || status !== "completed") return;
    let cancelled = false;
    reviewService
      .pending()
      .then((res) => {
        if (!cancelled) setReviewState(res.data.orders.some((o) => o._id === order._id) ? "pending" : "done");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isClient, status, order._id]);

  // Har action: API call, toast, dialog band, data refresh
  const run = (fn, message) => async (...args) => {
    await fn(...args);
    toast.success(message);
    close();
    onChanged();
  };

  return (
    <div className="flex flex-col gap-space-sm">
      {status === "cancelled" && (
        <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-space-sm">
          This order was cancelled on {formatDateTime(order.cancelledAt)} UTC.
          {order.cancelReason ? ` Reason: ${order.cancelReason}` : ""} Unreleased simulated funds were refunded.
        </p>
      )}

      {status === "revision_requested" && lastRevision && (
        <div className="bg-error-container text-on-error-container p-space-sm">
          <span className="font-label-sm text-label-sm uppercase font-bold block">Revision requested</span>
          <p className="font-body-sm text-body-sm whitespace-pre-line">{lastRevision.message}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-xs">
          {/* ---------------- Client ---------------- */}
          {isClient && status === "pending" && (
            <button type="button" onClick={() => setDialog("cancel")} className={dangerBtn}>
              <Icon name="cancel" className="text-body-sm" />
              Cancel Order
            </button>
          )}

          {isClient && status === "delivered" && (
            <>
              <button
                type="button"
                disabled={!revisionsLeft}
                title={revisionsLeft ? undefined : "No revisions left in this package"}
                onClick={() => setDialog("revision")}
                className={dangerBtn}
              >
                <Icon name="assignment_return" className="text-body-sm" />
                Request Revision
              </button>
              <button type="button" onClick={() => setDialog("complete")} className={primaryBtn}>
                <Icon name="check_circle" className="text-body-sm" />
                Approve &amp; Release Funds ({formatPrice(remaining)})
              </button>
            </>
          )}

          {isClient && status === "completed" && reviewState === "pending" && (
            <button type="button" onClick={() => setDialog("review")} className={primaryBtn}>
              <Icon name="star" filled className="text-body-sm" />
              Leave a Review
            </button>
          )}
          {isClient && status === "completed" && reviewState === "done" && (
            <span className="font-label-sm text-label-sm uppercase text-primary font-bold flex items-center gap-1">
              <Icon name="check_circle" className="text-body-sm" />
              Review submitted
            </span>
          )}

          {/* ---------------- Freelancer ---------------- */}
          {isFreelancer && status === "pending" && (
            <>
              <button type="button" onClick={() => setDialog("accept")} className={primaryBtn}>
                <Icon name="check_circle" className="text-body-sm" />
                Accept Order
              </button>
              <button type="button" onClick={() => setDialog("reject")} className={dangerBtn}>
                <Icon name="block" className="text-body-sm" />
                Reject Order
              </button>
            </>
          )}

          {isFreelancer && (status === "in_progress" || status === "revision_requested") && (
            <>
              <button type="button" onClick={() => setDialog("deliver")} className={primaryBtn}>
                <Icon name="inventory_2" className="text-body-sm" />
                {status === "revision_requested" ? "Deliver Revision" : "Deliver Work"}
              </button>
              <button type="button" onClick={() => setDialog("cancel")} className={dangerBtn}>
                <Icon name="cancel" className="text-body-sm" />
                Cancel Order
              </button>
            </>
          )}
        </div>

        <span className="font-code-sm text-code-sm text-on-surface-variant">DEMO ESCROW // SIMULATED</span>
      </div>

      {/* Waiting notes */}
      {isClient && status === "in_progress" && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          The seller is working on this order. Release each milestone&apos;s funds above once you are happy with it.
        </p>
      )}
      {isClient && status === "revision_requested" && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Waiting for the seller to deliver the revision.</p>
      )}
      {isFreelancer && status === "delivered" && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Delivered. Waiting for the client to approve or request a revision.
        </p>
      )}
      {isFreelancer && status === "pending" && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Accepting starts the order and sets the due date to {pkg.deliveryDays} days from now.
        </p>
      )}

      {/* ---------------- Dialogs ---------------- */}
      <ConfirmDialog
        open={dialog === "accept"}
        onClose={close}
        title="Accept this order?"
        description={`The order moves to In Progress and is due in ${pkg.deliveryDays} days.`}
        confirmLabel="Accept Order"
        onConfirm={run(() => orderService.accept(order._id), "Order accepted")}
      />

      <ConfirmDialog
        open={dialog === "reject"}
        onClose={close}
        title="Reject this order?"
        description="The client's simulated payment is refunded in full."
        confirmLabel="Reject Order"
        danger
        textLabel="Reason for the client"
        textPlaceholder="Optional: explain why you cannot take this order"
        onConfirm={run((reason) => orderService.reject(order._id, reason), "Order rejected and refunded")}
      />

      <ConfirmDialog
        open={dialog === "cancel"}
        onClose={close}
        title="Cancel this order?"
        description="Funds that were not released yet are refunded to the client. This cannot be undone."
        confirmLabel="Cancel Order"
        danger
        textLabel="Reason"
        textPlaceholder="Optional: tell the other party why"
        onConfirm={run((reason) => orderService.cancel(order._id, reason), "Order cancelled")}
      />

      <ConfirmDialog
        open={dialog === "revision"}
        onClose={close}
        title="Request a revision"
        description={
          pkg.unlimitedRevisions
            ? "This package includes unlimited revisions."
            : `Revision ${order.revisionsUsed + 1} of ${pkg.revisions} in this package.`
        }
        confirmLabel="Send Request"
        textLabel="What should change?"
        textMin={10}
        textMax={1000}
        textPlaceholder="Describe the changes you need..."
        onConfirm={run((message) => orderService.requestRevision(order._id, message), "Revision requested")}
      />

      <ConfirmDialog
        open={dialog === "complete"}
        onClose={close}
        title="Approve and complete?"
        description={`The order is marked completed and the remaining ${formatPrice(remaining)} is released to the seller from the demo escrow.`}
        confirmLabel="Approve & Release"
        onConfirm={run(() => orderService.complete(order._id), "Order completed. Funds released")}
      />

      <DeliverDialog
        open={dialog === "deliver"}
        onClose={close}
        revision={status === "revision_requested"}
        onSubmit={run((body) => orderService.deliver(order._id, body), "Work delivered")}
      />

      <ReviewDialog
        open={dialog === "review"}
        onClose={close}
        onSubmit={async (values) => {
          await reviewService.create({ orderId: order._id, ...values });
          toast.success("Thanks for your review");
          setReviewState("done");
          close();
          onChanged();
        }}
      />
    </div>
  );
}