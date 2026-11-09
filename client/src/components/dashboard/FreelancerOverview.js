"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { ActionLink, ErrorPanel, PageHeader, StatCard } from "./DashboardParts";
import RecentOrders from "./RecentOrders";
import { useApiData } from "@/hooks/useApiData";
import { useAuth } from "@/hooks/useAuth";
import * as dashboardService from "@/services/dashboardService";
import { SELLER_TIER_LABELS } from "@/lib/constants";
import { formatMoney, formatPrice, shortName, timeAgo } from "@/lib/utils";

const monthLabel = (month) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

function EarningsChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.amount), 0);

  return (
    <div className="flex items-end gap-space-sm" role="img" aria-label="Earnings for the last 6 months">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="font-code-sm text-[10px] text-on-surface-variant h-4 truncate">
            {d.amount > 0 ? formatPrice(d.amount) : ""}
          </span>
          <div className="h-32 w-full flex items-end">
            <div
              className="w-full bg-primary"
              style={{ height: max > 0 ? `${Math.max(3, (d.amount / max) * 100)}%` : "3px" }}
              title={`${d.month}: ${formatMoney(d.amount)}`}
            />
          </div>
          <span className="font-code-sm text-[10px] text-on-surface-variant uppercase">{monthLabel(d.month)}</span>
        </div>
      ))}
    </div>
  );
}

export default function FreelancerOverview() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useApiData(dashboardService.freelancer);
  const s = data?.stats;
  const wait = loading && !s;
  const num = (value) => (s ? String(value ?? 0) : "—");
  const pct = (value) => (!s ? "—" : value == null ? "N/A" : `${value}%`);

  return (
    <>
      <PageHeader
        eyebrow="DASHBOARD // FREELANCER"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Orders, earnings and performance for your gigs. Earnings in this demo are simulated."
        action={<ActionLink href="/orders">Manage orders</ActionLink>}
      />

      {error && <ErrorPanel message={error} onRetry={reload} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard
          label="New Requests"
          value={num(s?.newOrders)}
          icon="mark_email_unread"
          href="/orders"
          highlight={(s?.newOrders ?? 0) > 0}
          hint={(s?.newOrders ?? 0) > 0 ? "ACTION REQ." : "ALL CLEAR"}
          loading={wait}
        />
        <StatCard label="Active Orders" value={num(s?.activeOrders)} icon="pending_actions" href="/orders" loading={wait} />
        <StatCard
          label="Total Earned"
          value={s ? formatMoney(s.totalEarned) : "—"}
          icon="payments"
          hint="SIMULATED"
          loading={wait}
        />
        <StatCard
          label="In Escrow"
          value={s ? formatMoney(s.inEscrow) : "—"}
          icon="shield"
          hint="HELD FOR YOU"
          loading={wait}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard
          label="Rating"
          value={s ? (s.ratingCount > 0 ? s.ratingAverage.toFixed(1) : "—") : "—"}
          icon="star"
          hint={s ? `${s.ratingCount} ${s.ratingCount === 1 ? "REVIEW" : "REVIEWS"}` : undefined}
          loading={wait}
        />
        <StatCard label="Job Success" value={pct(s?.jobSuccessRate)} icon="task_alt" loading={wait} />
        <StatCard label="On-Time Delivery" value={pct(s?.onTimeDeliveryRate)} icon="schedule" loading={wait} />
        <StatCard
          label="Seller Tier"
          value={s ? SELLER_TIER_LABELS[s.sellerTier] ?? "—" : "—"}
          icon="military_tech"
          hint={s ? `${s.completedOrders} COMPLETED` : undefined}
          loading={wait}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-space-md">
        <section className="lg:col-span-3 bg-surface-container-lowest shadow-sm p-space-md">
          <div className="flex items-center justify-between mb-space-md">
            <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Earnings, Last 6 Months</h2>
            <span className="font-code-sm text-code-sm text-on-surface-variant">SIMULATED</span>
          </div>
          {wait ? <div className="h-44 bg-surface-container-low animate-pulse" /> : <EarningsChart data={data?.earningsByMonth} />}
        </section>

        <section className="lg:col-span-2 bg-surface-container-lowest shadow-sm p-space-md">
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface mb-space-md">Your Gigs</h2>
          <dl className="space-y-space-xs font-body-sm text-body-sm">
            {[
              ["Published", s?.gigs?.published],
              ["Drafts", s?.gigs?.draft],
              ["Paused", s?.gigs?.paused],
              ["Total views", s?.gigs?.totalViews],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between bg-surface-container-low px-space-sm py-2">
                <dt className="text-on-surface-variant">{label}</dt>
                <dd className="font-code-sm text-code-sm font-bold text-on-surface">{s ? value ?? 0 : "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="bg-surface-container-lowest shadow-sm">
        <div className="p-space-md border-b border-outline-variant">
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Top Performing Gigs</h2>
        </div>
        {wait ? (
          <div className="p-space-md h-20 animate-pulse" />
        ) : (data?.topGigs ?? []).length === 0 ? (
          <p className="p-space-lg font-body-sm text-body-sm text-on-surface-variant text-center">
            Completed orders will rank your gigs here.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {data.topGigs.map((gig) => (
              <li key={gig._id}>
                <Link
                  href={`/gigs/${gig.slug}`}
                  className="flex items-center justify-between gap-space-sm p-space-md hover:bg-surface-container-low transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md text-on-surface font-bold truncate">{gig.title}</p>
                    <p className="font-code-sm text-code-sm text-on-surface-variant">
                      {gig.completedOrders} COMPLETED · {gig.ratingCount > 0 ? `★ ${gig.ratingAverage.toFixed(1)}` : "NO REVIEWS"}
                    </p>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">{formatPrice(gig.revenue)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RecentOrders orders={data?.recentOrders} role="freelancer" loading={wait} />

      <section className="bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between p-space-md border-b border-outline-variant">
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Latest Reviews</h2>
          <Link href="/dashboard/reviews" className="font-label-sm text-label-sm uppercase font-bold text-primary hover:underline">
            View all
          </Link>
        </div>
        {(data?.recentReviews ?? []).length === 0 ? (
          <p className="p-space-lg font-body-sm text-body-sm text-on-surface-variant text-center">
            {wait ? "Loading..." : "No reviews yet."}
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {data.recentReviews.map((review) => (
              <li key={review._id} className="p-space-md">
                <div className="flex flex-wrap items-center justify-between gap-space-xs mb-1">
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    {shortName(review.client?.name)} <span className="text-primary">{"★".repeat(review.rating)}</span>
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">{timeAgo(review.createdAt)}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">“{review.comment}”</p>
                {review.gig?.title && (
                  <p className="font-code-sm text-code-sm text-on-surface-variant mt-1 uppercase truncate">
                    <Icon name="inventory_2" className="text-[14px] align-middle mr-1" />
                    {review.gig.title}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}