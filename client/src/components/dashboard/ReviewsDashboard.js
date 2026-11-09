"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import { ReviewDialog } from "@/components/orders/OrderDialogs";
import { EmptyState, ErrorPanel, PageHeader } from "./DashboardParts";
import { useApiData } from "@/hooks/useApiData";
import { useAuth } from "@/hooks/useAuth";
import * as reviewService from "@/services/reviewService";
import { capitalize, cn, formatPrice, timeAgo } from "@/lib/utils";

const PAGE_SIZE = 10;

function Stars({ value }) {
  return (
    <span className="flex text-primary" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" filled={n <= value} className={cn("text-body-sm", n > value && "text-outline-variant")} />
      ))}
    </span>
  );
}

// "Load more" wali list: page 1 hook se, aage ke pages append hote hain
function useReviewList() {
  const fetcher = useCallback(() => reviewService.mine({ page: 1, limit: PAGE_SIZE }), []);
  const first = useApiData(fetcher);
  const [extra, setExtra] = useState({ reviews: [], page: 1, hasNext: null, loading: false });
  const [overrides, setOverrides] = useState({});

  const hasNext = extra.hasNext ?? first.data?.pagination.hasNext ?? false;
  const reviews = [...(first.data?.reviews ?? []), ...extra.reviews].map((r) => ({ ...r, ...overrides[r._id] }));

  const loadMore = async () => {
    setExtra((e) => ({ ...e, loading: true }));
    try {
      const res = await reviewService.mine({ page: extra.page + 1, limit: PAGE_SIZE });
      setExtra((e) => ({
        reviews: [...e.reviews, ...res.data.reviews],
        page: e.page + 1,
        hasNext: res.data.pagination.hasNext,
        loading: false,
      }));
    } catch (err) {
      toast.error(err.message);
      setExtra((e) => ({ ...e, loading: false }));
    }
  };

  const patch = (id, values) => setOverrides((o) => ({ ...o, [id]: { ...o[id], ...values } }));
  const reload = () => {
    setExtra({ reviews: [], page: 1, hasNext: null, loading: false });
    first.reload();
  };

  return { ...first, reviews, hasNext, loadingMore: extra.loading, loadMore, patch, reload };
}

function LoadMore({ show, loading, onClick }) {
  if (!show) return null;
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-wider px-space-lg py-space-sm font-bold hover:bg-surface-container-highest transition-colors disabled:opacity-75"
      >
        {loading ? "Loading..." : "Load more"}
      </button>
    </div>
  );
}

/* ------------------------------ Client ------------------------------ */

function ClientReviews() {
  const pendingFetcher = useCallback(() => reviewService.pending(), []);
  const pending = useApiData(pendingFetcher);
  const list = useReviewList();
  const [target, setTarget] = useState(null);

  const submit = async (values) => {
    await reviewService.create({ orderId: target._id, ...values });
    toast.success("Thanks for your review");
    setTarget(null);
    pending.reload();
    list.reload();
  };

  const orders = pending.data?.orders ?? [];

  return (
    <>
      <PageHeader
        eyebrow="DASHBOARD // CLIENT"
        title="Reviews"
        subtitle="Rate completed orders and see the reviews you have written."
      />

      {(pending.error || list.error) && (
        <ErrorPanel message={pending.error || list.error} onRetry={() => { pending.reload(); list.reload(); }} />
      )}

      <section className="bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between p-space-md border-b border-outline-variant">
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Waiting for your review</h2>
          <span className="font-code-sm text-code-sm bg-primary text-on-primary px-2 py-0.5">{orders.length}</span>
        </div>
        {orders.length === 0 ? (
          <p className="p-space-lg font-body-sm text-body-sm text-on-surface-variant text-center">
            {pending.loading ? "Loading..." : "You are all caught up. Completed orders you have not rated appear here."}
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {orders.map((order) => (
              <li key={order._id} className="flex flex-wrap items-center justify-between gap-space-sm p-space-md">
                <div className="min-w-0">
                  <p className="font-code-sm text-code-sm text-on-surface-variant uppercase">
                    #{order.orderNumber} · {capitalize(order.selectedPackage?.tier ?? "")} · {formatPrice(order.amount)}
                  </p>
                  <p className="font-label-md text-label-md text-on-surface font-bold truncate">{order.gig?.title}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Seller: {order.freelancer?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTarget(order)}
                  className="bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-md py-2 hover:bg-primary-container transition-colors flex items-center gap-1"
                >
                  <Icon name="star" filled className="text-body-sm" />
                  Write review
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-space-md">
        <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Your reviews</h2>

        {!list.loading && list.reviews.length === 0 && (
          <EmptyState icon="rate_review" title="No reviews written yet" text="Your reviews will appear here." />
        )}

        {list.reviews.map((review) => (
          <article key={review._id} className="bg-surface-container-lowest shadow-sm p-space-md">
            <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-xs">
              <div className="flex items-center gap-space-sm min-w-0">
                <Avatar user={review.freelancer} size="w-8 h-8" shape="square" />
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-on-surface font-bold truncate">{review.freelancer?.name}</p>
                  {review.gig && (
                    <Link href={`/gigs/${review.gig.slug}`} className="font-code-sm text-code-sm text-primary uppercase hover:underline truncate block">
                      {review.gig.title}
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-space-sm">
                <Stars value={review.rating} />
                <span className="font-code-sm text-code-sm text-on-surface-variant">{timeAgo(review.createdAt)}</span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface">“{review.comment}”</p>
            {review.sellerResponse?.message && (
              <div className="bg-surface-container-low p-space-sm mt-space-sm ml-space-md">
                <span className="font-label-sm text-label-sm uppercase font-bold text-primary block mb-1">Seller response</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{review.sellerResponse.message}</p>
              </div>
            )}
          </article>
        ))}

        <LoadMore show={list.hasNext} loading={list.loadingMore} onClick={list.loadMore} />
      </section>

      <ReviewDialog open={Boolean(target)} onClose={() => setTarget(null)} onSubmit={submit} />
    </>
  );
}

/* ---------------------------- Freelancer ---------------------------- */

function ReplyForm({ review, onSaved, onCancel }) {
  const [message, setMessage] = useState(review.sellerResponse?.message ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 2) return setError("Please write a response.");
    setBusy(true);
    setError("");
    try {
      const res = await reviewService.respond(review._id, message.trim());
      toast.success("Response saved");
      onSaved(res.data.review.sellerResponse);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-space-sm space-y-space-xs">
      <textarea
        rows={3}
        maxLength={800}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        aria-label="Your response"
        placeholder="Thank the client or add context..."
        className="w-full border border-outline bg-surface-container-lowest p-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-on-surface"
      />
      {error && <p role="alert" className="font-body-sm text-body-sm text-error">{error}</p>}
      <div className="flex gap-space-xs">
        <button
          type="submit"
          disabled={busy}
          className="bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-md py-1.5 disabled:opacity-75"
        >
          {busy ? "Saving..." : "Save response"}
        </button>
        <button type="button" onClick={onCancel} className="px-space-md py-1.5 border border-outline font-label-sm text-label-sm uppercase">
          Cancel
        </button>
      </div>
    </form>
  );
}

function FreelancerReviews() {
  const list = useReviewList();
  const [replying, setReplying] = useState(null);

  return (
    <>
      <PageHeader
        eyebrow="DASHBOARD // FREELANCER"
        title="Reviews"
        subtitle="Every review comes from a completed order. Reply publicly to thank clients or add context."
      />

      {list.error && <ErrorPanel message={list.error} onRetry={list.reload} />}

      {!list.loading && list.reviews.length === 0 && (
        <EmptyState icon="rate_review" title="No reviews yet" text="Reviews appear here after a client completes and rates an order." />
      )}

      <div className="space-y-space-md">
        {list.reviews.map((review) => (
          <article key={review._id} className="bg-surface-container-lowest shadow-sm p-space-md">
            <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-xs">
              <div className="flex items-center gap-space-sm min-w-0">
                <Avatar user={review.client} size="w-8 h-8" shape="square" />
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-on-surface font-bold truncate">{review.client?.name}</p>
                  {review.gig && (
                    <Link href={`/gigs/${review.gig.slug}`} className="font-code-sm text-code-sm text-primary uppercase hover:underline truncate block">
                      {review.gig.title}
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-space-sm">
                <Stars value={review.rating} />
                <span className="font-code-sm text-code-sm text-on-surface-variant">{timeAgo(review.createdAt)}</span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface">“{review.comment}”</p>

            {replying === review._id ? (
              <ReplyForm
                review={review}
                onCancel={() => setReplying(null)}
                onSaved={(sellerResponse) => {
                  list.patch(review._id, { sellerResponse });
                  setReplying(null);
                }}
              />
            ) : (
              <>
                {review.sellerResponse?.message && (
                  <div className="bg-surface-container-low p-space-sm mt-space-sm ml-space-md">
                    <span className="font-label-sm text-label-sm uppercase font-bold text-primary block mb-1">Your response</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{review.sellerResponse.message}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setReplying(review._id)}
                  className="mt-space-sm font-label-sm text-label-sm uppercase font-bold text-primary hover:underline"
                >
                  {review.sellerResponse?.message ? "Edit response" : "Reply"}
                </button>
              </>
            )}
          </article>
        ))}
      </div>

      <LoadMore show={list.hasNext} loading={list.loadingMore} onClick={list.loadMore} />
    </>
  );
}

export default function ReviewsDashboard() {
  const { user } = useAuth();
  return user.role === "freelancer" ? <FreelancerReviews /> : <ClientReviews />;
}