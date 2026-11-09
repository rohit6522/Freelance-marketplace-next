"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import * as reviewService from "@/services/reviewService";
import { getPageItems } from "@/lib/gigParams";
import { capitalize, cn, formatMoney, getInitials, shortName } from "@/lib/utils";

const PAGE_SIZE = 5;
const EMPTY_SUMMARY = { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

const monthYear = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase()
    : "";

const starText = (n) => "★".repeat(n) + "☆".repeat(5 - n);

const pageButton =
  "px-3 py-1 bg-surface-container text-on-surface border border-outline font-label-sm text-label-sm uppercase hover:bg-on-surface hover:text-white transition-none disabled:opacity-50 disabled:cursor-not-allowed";

function ReviewItem({ review, index, sellerName }) {
  const tier = review.order?.selectedPackage?.tier;
  const when = monthYear(review.order?.completedAt || review.createdAt);
  const subtitle = [review.client?.companyName, review.client?.country && `(${review.client.country})`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-surface-container-lowest border border-outline p-space-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-space-xs border-b border-outline-variant gap-2">
        <div className="flex items-center gap-space-sm min-w-0">
          <div
            className={cn(
              "w-10 h-10 flex items-center justify-center font-bold font-code-sm shrink-0",
              index % 2 === 0 ? "bg-on-surface text-surface" : "bg-primary text-white"
            )}
          >
            {getInitials(review.client?.name)}
          </div>
          <div className="min-w-0">
            <h4 className="font-label-md text-label-md font-bold text-on-surface uppercase truncate">
              {review.client?.name}
            </h4>
            {subtitle && <span className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-space-md font-code-sm text-code-sm">
          <span className="text-primary font-bold">
            {starText(review.rating)} {review.rating}.0
          </span>
          {review.order?.amount != null && (
            <span className="bg-surface-container px-2 py-0.5 border border-outline-variant">
              PAID: {formatMoney(review.order.amount)} (SIMULATED)
            </span>
          )}
          {when && <span className="text-on-surface-variant hidden md:inline">COMPLETED {when}</span>}
        </div>
      </div>

      <p className="font-body-md text-body-md text-on-surface mt-space-sm">“{review.comment}”</p>

      {review.sellerResponse?.message && (
        <div className="bg-surface-container-low p-space-sm mt-space-sm ml-space-md">
          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase font-bold text-primary mb-1">
            <Icon name="subdirectory_arrow_right" className="text-body-sm" />
            Seller Response // {shortName(sellerName)}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{review.sellerResponse.message}</p>
        </div>
      )}

      <div className="mt-space-sm pt-space-xs border-t border-outline-variant flex flex-wrap items-center gap-space-md font-code-sm text-[12px] text-on-surface-variant">
        {review.gig?.title && <span>PROJECT: {review.gig.title}</span>}
        {tier && (
          <>
            <span>•</span>
            <span>PACKAGE: {capitalize(tier).toUpperCase()}</span>
          </>
        )}
        <span>•</span>
        <span className="text-primary font-bold">VERIFIED ORDER</span>
      </div>
    </div>
  );
}

export default function ProfileReviews({ freelancerId, sellerName, initial }) {
  const [data, setData] = useState({
    reviews: initial?.reviews ?? [],
    summary: initial?.summary ?? EMPTY_SUMMARY,
    pagination: initial?.pagination ?? null,
  });
  const [query, setQuery] = useState({ rating: "", page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstRun = useRef(true);

  // Filter ya page badle to naya data (pehli baar server ka data use hota hai)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    reviewService
      .list({ freelancer: freelancerId, rating: query.rating || undefined, page: query.page, limit: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [freelancerId, query]);

  const { reviews, summary, pagination } = data;
  const hasAny = summary.count > 0;

  return (
    <section className="space-y-space-md scroll-mt-36" id="section-reviews">
      <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-outline pb-space-xs">
        <div>
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">
            Verified Client Testimonials
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Ratings tied directly to completed orders
          </p>
        </div>
        {hasAny && (
          <select
            aria-label="Filter reviews by rating"
            value={query.rating}
            onChange={(e) => setQuery({ rating: e.target.value, page: 1 })}
            className="font-code-sm text-code-sm bg-surface-container-high px-2 py-1 font-bold border border-outline-variant focus:outline-none"
          >
            <option value="">FILTER: ALL ({summary.count})</option>
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>
                {star} STAR{star > 1 ? "S" : ""} ({summary.distribution[star] ?? 0})
              </option>
            ))}
          </select>
        )}
      </div>

      {!hasAny ? (
        <div className="border border-outline bg-surface-container-lowest p-space-lg text-center">
          <Icon name="rate_review" className="text-[32px] text-outline mb-space-xs" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No reviews yet. Reviews appear after a client completes and rates an order.
          </p>
        </div>
      ) : (
        <>
          <div className={cn("space-y-space-md", loading && "opacity-60")} aria-busy={loading}>
            {reviews.map((review, index) => (
              <ReviewItem key={review._id} review={review} index={index} sellerName={sellerName} />
            ))}
            {reviews.length === 0 && !loading && !error && (
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-space-md">
                No reviews with this rating.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="font-body-sm text-body-sm text-error">
              {error}
            </p>
          )}

          {pagination && (
            <div className="bg-surface-container-low border border-outline p-space-sm flex flex-wrap items-center justify-between gap-space-sm">
              <span className="font-code-sm text-code-sm text-on-surface-variant">
                DISPLAYING {reviews.length} OF {pagination.total} REVIEWS
              </span>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!pagination.hasPrev || loading}
                    onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
                    className={pageButton}
                  >
                    Prev
                  </button>
                  {getPageItems(pagination.page, pagination.totalPages).map((item, i) =>
                    item === "gap" ? (
                      <span key={`gap-${i}`} className="px-2 font-code-sm">
                        ...
                      </span>
                    ) : item === pagination.page ? (
                      <span key={item} className="px-3 py-1 bg-on-surface text-surface font-label-sm text-label-sm">
                        {item}
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        disabled={loading}
                        onClick={() => setQuery((q) => ({ ...q, page: item }))}
                        className={pageButton}
                      >
                        {item}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    disabled={!pagination.hasNext || loading}
                    onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
                    className={pageButton}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}