"use client";

import { ActionLink, ErrorPanel, PageHeader, StatCard } from "./DashboardParts";
import RecentOrders from "./RecentOrders";
import { useApiData } from "@/hooks/useApiData";
import { useAuth } from "@/hooks/useAuth";
import * as dashboardService from "@/services/dashboardService";
import { formatMoney } from "@/lib/utils";

export default function ClientOverview() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useApiData(dashboardService.client);
  const s = data?.stats;
  const num = (value) => (s ? String(value ?? 0) : "—");

  return (
    <>
      <PageHeader
        eyebrow="DASHBOARD // CLIENT"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Your orders, spend and saved gigs at a glance. Payments in this demo are simulated."
        action={<ActionLink href="/gigs">Browse gigs</ActionLink>}
      />

      {error && <ErrorPanel message={error} onRetry={reload} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard label="Active Orders" value={num(s?.activeOrders)} icon="pending_actions" href="/orders" loading={loading && !s} />
        <StatCard
          label="Awaiting Review"
          value={num(s?.awaitingReview)}
          icon="rate_review"
          href="/orders"
          highlight={(s?.awaitingReview ?? 0) > 0}
          hint={(s?.awaitingReview ?? 0) > 0 ? "ACTION REQ." : "ALL CLEAR"}
          loading={loading && !s}
        />
        <StatCard
          label="Total Spent"
          value={s ? formatMoney(s.totalSpent) : "—"}
          icon="payments"
          hint="SIMULATED"
          loading={loading && !s}
        />
        <StatCard
          label="In Escrow"
          value={s ? formatMoney(s.inEscrow) : "—"}
          icon="shield"
          hint="DEMO ESCROW"
          loading={loading && !s}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard label="Completed" value={num(s?.completedOrders)} icon="verified" href="/orders" loading={loading && !s} />
        <StatCard label="Saved Gigs" value={num(s?.savedGigs)} icon="favorite" href="/dashboard/saved" loading={loading && !s} />
        <StatCard
          label="Unread Messages"
          value={num(s?.unreadMessages)}
          icon="chat"
          href="/messages"
          highlight={(s?.unreadMessages ?? 0) > 0}
          loading={loading && !s}
        />
        <StatCard
          label="Reviews Pending"
          value={num(s?.reviewsPending)}
          icon="star"
          href="/dashboard/reviews"
          highlight={(s?.reviewsPending ?? 0) > 0}
          hint={(s?.reviewsPending ?? 0) > 0 ? "WRITE A REVIEW" : undefined}
          loading={loading && !s}
        />
      </div>

      <RecentOrders orders={data?.recentOrders} role="client" loading={loading && !data} />
    </>
  );
}