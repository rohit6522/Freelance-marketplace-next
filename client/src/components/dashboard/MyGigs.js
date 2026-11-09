"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { ConfirmDialog } from "@/components/orders/OrderDialogs";
import { ActionLink, EmptyState, ErrorPanel, PageHeader } from "./DashboardParts";
import { useApiData } from "@/hooks/useApiData";
import * as gigService from "@/services/gigService";
import { errorText } from "@/lib/errors";
import { cn, formatPrice } from "@/lib/utils";

const TABS = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "paused", label: "Paused" },
];

const STATUS_CHIP = {
  published: "bg-primary-container text-on-primary-container",
  draft: "bg-surface-container-high text-on-surface",
  paused: "bg-secondary-fixed text-on-surface",
};

const iconBtn =
  "px-space-sm py-1.5 border border-outline font-label-sm text-label-sm uppercase font-bold flex items-center gap-1 hover:bg-surface-container disabled:opacity-60";

export default function MyGigs() {
  const [filter, setFilter] = useState({ status: "", page: 1 });
  const [counts, setCounts] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fetcher = useCallback(() => gigService.mine({ status: filter.status, page: filter.page, limit: 8 }), [filter]);
  const { data, error, loading, reload } = useApiData(fetcher);

  const loadCounts = useCallback(async () => {
    try {
      const results = await Promise.all(["", "published", "draft", "paused"].map((status) => gigService.mine({ status, limit: 1 })));
      setCounts({
        "": results[0].data.pagination.total,
        published: results[1].data.pagination.total,
        draft: results[2].data.pagination.total,
        paused: results[3].data.pagination.total,
      });
    } catch {
      // counts sirf tab labels ke liye hain
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const refresh = () => {
    reload();
    loadCounts();
  };

  const changeStatus = async (gig, status, message) => {
    setBusyId(gig._id);
    try {
      await gigService.setStatus(gig._id, status);
      toast.success(message);
      refresh();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusyId(null);
    }
  };

  const gigs = data?.gigs ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <PageHeader
        eyebrow="DASHBOARD // FREELANCER"
        title="My Gigs"
        subtitle="Create, publish and manage your services. Only published gigs appear in the marketplace."
        action={<ActionLink href="/dashboard/create-gig">+ Create gig</ActionLink>}
      />

      <div className="flex items-center gap-space-xs overflow-x-auto bg-surface-container-lowest p-space-xs shadow-sm no-scrollbar">
        {TABS.map((tab) => {
          const active = filter.status === tab.value;
          return (
            <button
              key={tab.value || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter({ status: tab.value, page: 1 })}
              className={cn(
                "px-space-md py-2 font-label-sm text-label-sm uppercase whitespace-nowrap transition-colors",
                active ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container-low text-on-surface hover:bg-surface-container"
              )}
            >
              {tab.label}
              {counts ? ` (${counts[tab.value]})` : ""}
            </button>
          );
        })}
      </div>

      {error && <ErrorPanel message={error} onRetry={reload} />}

      {loading && !data && (
        <div className="space-y-space-sm">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-surface-container-lowest animate-pulse" />
          ))}
        </div>
      )}

      {data && gigs.length === 0 && (
        <EmptyState
          icon="inventory_2"
          title={filter.status ? "No gigs in this tab" : "You have no gigs yet"}
          text="Create your first gig, add three packages and publish it to start getting orders."
          action={<ActionLink href="/dashboard/create-gig">+ Create gig</ActionLink>}
        />
      )}

      <div className={cn("space-y-space-sm", loading && data && "opacity-60")} aria-busy={loading}>
        {gigs.map((gig) => (
          <article key={gig._id} className="bg-surface-container-lowest shadow-sm flex flex-col md:flex-row">
            <div className="md:w-44 h-32 md:h-auto bg-surface-container-high shrink-0 overflow-hidden">
              {gig.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="w-full h-full object-cover" src={gig.images[0].url} alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-outline">
                  <Icon name="image" className="text-[32px]" />
                </div>
              )}
            </div>

            <div className="flex-1 p-space-md min-w-0">
              <div className="flex flex-wrap items-center gap-space-xs mb-1">
                <span className={cn("font-label-sm text-label-sm px-space-xs py-0.5 uppercase tracking-wider font-semibold", STATUS_CHIP[gig.status])}>
                  {gig.status}
                </span>
                {gig.category?.name && (
                  <span className="font-code-sm text-code-sm text-on-surface-variant uppercase">{gig.category.name}</span>
                )}
              </div>

              <Link
                href={`/dashboard/gigs/${gig._id}/edit`}
                className="font-headline-sm text-headline-sm text-on-surface font-bold hover:text-primary line-clamp-2"
              >
                {gig.title}
              </Link>

              <dl className="mt-space-sm grid grid-cols-2 sm:grid-cols-5 gap-space-sm font-code-sm text-code-sm">
                {[
                  ["FROM", gig.startingPrice ? formatPrice(gig.startingPrice) : "—"],
                  ["RATING", gig.ratingCount > 0 ? `★ ${gig.ratingAverage.toFixed(1)} (${gig.ratingCount})` : "—"],
                  ["VIEWS", gig.views ?? 0],
                  ["ORDERS", gig.orders?.total ?? 0],
                  ["ACTIVE / DONE", `${gig.orders?.active ?? 0} / ${gig.orders?.completed ?? 0}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-on-surface-variant text-[11px]">{label}</dt>
                    <dd className="text-on-surface font-bold">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-wrap items-center gap-space-xs mt-space-md">
                <Link href={`/dashboard/gigs/${gig._id}/edit`} className={iconBtn}>
                  <Icon name="edit" className="text-body-sm" />
                  Edit
                </Link>
                <Link href={`/gigs/${gig.slug}`} target="_blank" className={iconBtn}>
                  <Icon name="visibility" className="text-body-sm" />
                  {gig.status === "published" ? "View" : "Preview"}
                </Link>

                {gig.status === "published" ? (
                  <button type="button" disabled={busyId === gig._id} onClick={() => changeStatus(gig, "paused", "Gig paused")} className={iconBtn}>
                    <Icon name="pause_circle" className="text-body-sm" />
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === gig._id}
                    onClick={() => changeStatus(gig, "published", "Gig published")}
                    className="px-space-sm py-1.5 bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold flex items-center gap-1 hover:bg-primary-container disabled:opacity-60"
                  >
                    <Icon name="publish" className="text-body-sm" />
                    Publish
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setToDelete(gig)}
                  className="px-space-sm py-1.5 border border-outline font-label-sm text-label-sm uppercase font-bold flex items-center gap-1 hover:bg-error hover:text-on-error hover:border-error"
                >
                  <Icon name="delete" className="text-body-sm" />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-surface-container-lowest p-space-xs shadow-sm">
          <button
            type="button"
            disabled={!pagination.hasPrev || loading}
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
            disabled={!pagination.hasNext || loading}
            onClick={() => setFilter((f) => ({ ...f, page: f.page + 1 }))}
            className="px-space-md py-1.5 bg-surface-container-low font-label-sm text-label-sm uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete this gig?"
        description={`"${toDelete?.title ?? ""}" will be removed permanently. Gigs that already have orders cannot be deleted; pause them instead.`}
        confirmLabel="Delete gig"
        danger
        onConfirm={async () => {
          await gigService.remove(toDelete._id);
          toast.success("Gig deleted");
          setToDelete(null);
          refresh();
        }}
      />
    </>
  );
}