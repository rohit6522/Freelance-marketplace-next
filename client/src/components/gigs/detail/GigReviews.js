"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import * as reviewService from "@/services/reviewService";
import { capitalize, cn, shortName, timeAgo } from "@/lib/utils";

const SORTS = [
  { value: "recent", label: "Recent" },
  { value: "highest", label: "Highest" },
  { value: "lowest", label: "Lowest" },
];

const BAR_COLORS = { 5: "bg-primary", 4: "bg-primary-fixed-dim" };

function Stars({ value, size = "text-body-sm" }) {
  return (
    <div className="flex text-primary">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" filled={n <= value} className={cn(size, n > value && "text-outline-variant")} />
      ))}
    </div>
  );
}

function ReviewCard({ review, sellerName }) {
  const { user } = useAuth();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  const canReport = Boolean(user) && user._id !== review.client?._id;
  const tier = review.order?.selectedPackage?.tier;

  const submitReport = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      toast.error("Please describe the problem (at least 5 characters).");
      return;
    }
    setSending(true);
    try {
      await reviewService.report(review._id, reason.trim());
      toast.success("Thanks. The review has been reported.");
      setReporting(false);
      setReason("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-surface-container-low p-space-md">
      <div className="flex items-start justify-between gap-space-md mb-space-sm">
        <div className="flex items-center gap-space-md">
          <Avatar user={review.client} size="w-10 h-10" shape="square" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-headline-sm text-body-md font-bold text-on-surface">{review.client?.name}</span>
              {review.client?.country && (
                <span className="font-code-sm text-code-sm bg-surface-container-highest text-on-surface px-1 font-bold uppercase">
                  {review.client.country}
                </span>
              )}
              <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-1 font-bold">
                VERIFIED ORDER
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Stars value={review.rating} />
              <span className="font-code-sm text-code-sm text-on-surface-variant" suppressHydrationWarning>
                {timeAgo(review.createdAt)}
                {tier ? ` // ${capitalize(tier)} Package` : ""}
              </span>
            </div>
          </div>
        </div>

        {canReport && (
          <button
            type="button"
            onClick={() => setReporting((r) => !r)}
            className="font-label-sm text-label-sm uppercase text-on-surface-variant hover:text-error shrink-0"
          >
            Report
          </button>
        )}
      </div>

      <p className="font-body-md text-body-md text-on-surface mb-space-md">“{review.comment}”</p>

      {review.sellerResponse?.message && (
        <div className="bg-surface-container-lowest p-space-md ml-space-md">
          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase font-bold text-primary mb-1">
            <Icon name="subdirectory_arrow_right" className="text-body-sm" />
            Seller Response // {shortName(sellerName)}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{review.sellerResponse.message}</p>
        </div>
      )}

      {reporting && (
        <form onSubmit={submitReport} className="mt-space-md flex flex-col sm:flex-row gap-space-sm">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={300}
            placeholder="Why are you reporting this review?"
            className="flex-1 bg-surface-container-lowest border border-outline-variant px-space-sm py-2 font-body-sm text-body-sm focus:outline-none focus:border-on-surface"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-on-surface text-surface font-label-sm text-label-sm uppercase font-bold px-space-md py-2 disabled:opacity-75"
          >
            {sending ? "Sending..." : "Send report"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function GigReviews({ gigId, sellerName, initial }) {
  const [data, setData] = useState({
    reviews: initial?.reviews ?? [],
    summary: initial?.summary ?? { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    pagination: initial?.pagination ?? null,
  });
  const [sort, setSort] = useState("recent");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstRun = useRef(true);
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (page, { append = false } = {}) => {
      const id = ++requestId.current;
      setLoading(true);
      setError("");
      try {
        const res = await reviewService.list({ gig: gigId, q: q || undefined, sort, page, limit: 5 });
        if (id !== requestId.current) return;
        setData((prev) => ({
          reviews: append ? [...prev.reviews, ...res.data.reviews] : res.data.reviews,
          summary: res.data.summary,
          pagination: res.data.pagination,
        }));
      } catch (err) {
        if (id === requestId.current) setError(err.message);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [gigId, q, sort]
  );

  // Search ya sort badle to page 1 dobara (pehli baar server ka data use hota hai)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    fetchPage(1);
  }, [fetchPage]);

  // Typing ke 400ms baad hi search
  useEffect(() => {
    const timer = setTimeout(() => setQ(qInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [qInput]);

  const { summary, reviews, pagination } = data;
  const hasAnyReview = summary.count > 0;

  return (
    <section className="bg-surface-container-lowest p-space-xl shadow-sm">
      <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-xs inline-block">
        MODULE 04 // VERIFIED PERFORMANCE AUDIT
      </div>
      <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-space-lg">
        Client Verification &amp; Reviews
      </h2>

      {!hasAnyReview ? (
        <div className="bg-surface-container-low p-space-lg text-center">
          <Icon name="rate_review" className="text-[36px] text-outline mb-space-xs" />
          <p className="font-headline-sm text-headline-sm text-on-surface uppercase">No reviews yet</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Reviews appear here after a client completes and rates an order.
          </p>
        </div>
      ) : (
        <>
          {/* Aggregate */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg bg-surface-container-low p-space-lg mb-space-lg items-center">
            <div className="md:col-span-4 text-center md:text-left">
              <div className="font-headline-xl text-headline-xl text-primary font-bold leading-none">
                {summary.average.toFixed(1)}
              </div>
              <div className="flex justify-center md:justify-start my-space-xs">
                <Stars value={Math.round(summary.average)} size="text-body-lg" />
              </div>
              <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                {summary.count} Verified Order {summary.count === 1 ? "Review" : "Reviews"}
              </div>
            </div>

            <div className="md:col-span-8 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.distribution[star] ?? 0;
                const percent = summary.count ? Math.round((count / summary.count) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface">
                    <span className="w-8 font-bold">{star} ★</span>
                    <div className="flex-1 h-3 bg-surface-container-highest">
                      <div className={cn("h-full", BAR_COLORS[star] ?? "bg-secondary")} style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-12 text-right font-code-sm text-code-sm text-on-surface-variant font-bold">
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
            <div className="flex items-center bg-surface-container-low px-space-sm py-1.5 flex-1 max-w-sm">
              <Icon name="search" className="text-outline-variant text-body-md mr-2" />
              <input
                type="text"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                maxLength={100}
                placeholder="Filter keyword (e.g. handoff, speed)..."
                aria-label="Filter reviews by keyword"
                className="bg-transparent border-0 font-body-sm text-body-sm text-on-surface focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-1 font-label-sm text-label-sm uppercase font-bold overflow-x-auto">
              <span className="text-on-surface-variant mr-1">Sort:</span>
              {SORTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSort(option.value)}
                  className={cn(
                    "px-space-sm py-1",
                    sort === option.value
                      ? "bg-on-surface text-surface"
                      : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className={cn("space-y-space-lg", loading && "opacity-60")} aria-busy={loading}>
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} sellerName={sellerName} />
            ))}

            {reviews.length === 0 && !loading && !error && (
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-space-md">
                No reviews match your keyword.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-space-md font-body-sm text-body-sm text-error">
              {error}
            </p>
          )}

          {pagination?.hasNext && (
            <div className="mt-space-lg text-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => fetchPage(pagination.page + 1, { append: true })}
                className="bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-wider px-space-lg py-space-sm font-bold hover:bg-surface-container-highest transition-colors disabled:opacity-75"
              >
                {loading ? "Loading..." : "Load more reviews"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}