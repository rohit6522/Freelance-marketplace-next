"use client";

import { useCallback, useState } from "react";
import GigCard from "@/components/gigs/GigCard";
import { ActionLink, EmptyState, ErrorPanel, PageHeader } from "./DashboardParts";
import { useApiData } from "@/hooks/useApiData";
import * as favoriteService from "@/services/favoriteService";

export default function SavedGigs() {
  const [page, setPage] = useState(1);
  const fetcher = useCallback(() => favoriteService.list({ page, limit: 12 }), [page]);
  const { data, error, loading, reload } = useApiData(fetcher);

  const gigs = data?.gigs ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <PageHeader
        eyebrow="DASHBOARD // CLIENT"
        title="Saved Gigs"
        subtitle="Gigs you bookmarked. Only gigs that are still published are shown."
        action={<ActionLink href="/gigs">Browse gigs</ActionLink>}
      />

      {error && <ErrorPanel message={error} onRetry={reload} />}

      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-80 bg-surface-container-lowest animate-pulse" />
          ))}
        </div>
      )}

      {data && gigs.length === 0 && (
        <EmptyState
          icon="favorite"
          title="No saved gigs yet"
          text="Tap the heart on any gig to save it here for later."
          action={<ActionLink href="/gigs">Explore gigs</ActionLink>}
        />
      )}

      {gigs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {gigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-surface-container-lowest p-space-xs shadow-sm">
          <button
            type="button"
            disabled={!pagination.hasPrev || loading}
            onClick={() => setPage((p) => p - 1)}
            className="px-space-md py-1.5 bg-surface-container-low font-label-sm text-label-sm uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container"
          >
            Prev
          </button>
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            PAGE {pagination.page} OF {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={!pagination.hasNext || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-space-md py-1.5 bg-surface-container-low font-label-sm text-label-sm uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}