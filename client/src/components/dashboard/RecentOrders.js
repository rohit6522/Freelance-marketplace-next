import Link from "next/link";
import { STATUS_META, getListMeta, statusLabel } from "@/lib/orders";
import { cn, formatMoney } from "@/lib/utils";

export default function RecentOrders({ orders = [], role, loading }) {
  return (
    <section className="bg-surface-container-lowest shadow-sm">
      <div className="flex items-center justify-between p-space-md border-b border-outline-variant">
        <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Recent Orders</h2>
        <Link href="/orders" className="font-label-sm text-label-sm uppercase font-bold text-primary hover:underline">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="p-space-md space-y-space-sm">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="p-space-lg font-body-sm text-body-sm text-on-surface-variant text-center">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-outline-variant">
          {orders.map((order) => {
            const other = role === "client" ? order.freelancer : order.client;
            return (
              <li key={order._id}>
                <Link
                  href={`/orders?id=${order._id}`}
                  className="flex flex-wrap items-center justify-between gap-space-sm p-space-md hover:bg-surface-container-low transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-space-xs mb-1">
                      <span className="font-code-sm text-code-sm font-bold bg-surface-container px-space-xs py-0.5 text-on-surface">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={cn(
                          "font-label-sm text-label-sm px-space-xs py-0.5 uppercase tracking-wider font-semibold",
                          STATUS_META[order.status]?.chip
                        )}
                      >
                        {statusLabel(order.status, role)}
                      </span>
                    </div>
                    <p className="font-label-md text-label-md text-on-surface font-bold truncate">{order.gig?.title}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {other?.companyName || other?.name} · {getListMeta(order).text}
                    </p>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{formatMoney(order.amount)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}