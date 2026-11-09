"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import OrderFilters from "./OrderFilters";
import OrderMetrics from "./OrderMetrics";
import OrderList from "./OrderList";
import OrderDetail from "./OrderDetail";
import { useAuth } from "@/hooks/useAuth";
import * as orderService from "@/services/orderService";
import * as paymentService from "@/services/paymentService";
import { downloadCsv, ordersToCsv } from "@/lib/orders";

const PAGE_SIZE = 8;

export default function OrdersWorkspace({ initialId }) {
  const { user } = useAuth();
  const role = user.role;

  const [filters, setFilters] = useState({ status: "", q: "", sort: "newest", page: 1 });
  const [qInput, setQInput] = useState("");
  const [list, setList] = useState({ orders: [], pagination: null, counts: null });
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [summary, setSummary] = useState(null);
  const [selectedId, setSelectedId] = useState(initialId);
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const requestId = useRef(0);

  // Search: typing ke 400ms baad
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = qInput.trim();
      setFilters((f) => (f.q === q ? f : { ...f, q, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [qInput]);

  const fetchList = useCallback(
    async (silent) => {
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      try {
        const res = await orderService.list({ ...filters, limit: PAGE_SIZE });
        if (id !== requestId.current) return;
        setList(res.data);
        setListError("");
      } catch (err) {
        if (id === requestId.current && !silent) setListError(err.message);
      } finally {
        if (id === requestId.current && !silent) setLoading(false);
      }
    },
    [filters]
  );

  // Filter badle to loading dikhate hue
  useEffect(() => {
    fetchList(false);
  }, [fetchList]);

  // Kisi action ke baad ya timer par: chup-chap refresh
  useEffect(() => {
    if (refreshKey > 0) fetchList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    paymentService
      .getSummary()
      .then((res) => setSummary(res.data))
      .catch(() => {});
  }, [refreshKey]);

  // Doosri party ke changes dikhane ke liye har 30 second
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") setRefreshKey((k) => k + 1);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Kuch select nahi hai to pehla order
  useEffect(() => {
    if (!selectedId && list.orders.length > 0) setSelectedId(list.orders[0]._id);
  }, [list.orders, selectedId]);

  const select = useCallback((id) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `/orders?id=${id}`);
    if (window.innerWidth < 1024) {
      document.getElementById("order-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const onChanged = useCallback(() => setRefreshKey((k) => k + 1), []);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = [];
      for (let page = 1; page <= 10; page++) {
        const res = await orderService.list({ status: filters.status, q: filters.q, sort: filters.sort, page, limit: 50 });
        all.push(...res.data.orders);
        if (!res.data.pagination.hasNext) break;
      }
      if (all.length === 0) {
        toast.info("There are no orders to export.");
        return;
      }
      downloadCsv(`gigcraft-orders-${new Date().toISOString().slice(0, 10)}.csv`, ordersToCsv(all, role));
      toast.success(`Exported ${all.length} order${all.length === 1 ? "" : "s"}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  const noOrdersAtAll = !loading && !listError && list.counts?.all === 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg flex flex-col gap-space-lg">
      <OrderFilters
        filters={filters}
        counts={list.counts}
        qInput={qInput}
        onQInput={setQInput}
        onStatus={(status) => setFilters((f) => ({ ...f, status, page: 1 }))}
        onExport={exportCsv}
        exporting={exporting}
      />

      <OrderMetrics role={role} counts={list.counts} summary={summary} />

      {noOrdersAtAll ? (
        <div className="bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <Icon name="receipt_long" className="text-[40px] text-outline mb-space-sm" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">No orders yet</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs mb-space-md">
            {role === "client"
              ? "Find a gig, pick a package and place your first order."
              : "Orders from clients will appear here as soon as someone buys one of your gigs."}
          </p>
          <Link
            href="/gigs"
            className="inline-block bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-lg py-space-sm hover:bg-primary-container transition-colors"
          >
            Browse gigs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <OrderList
            orders={list.orders}
            pagination={list.pagination}
            loading={loading}
            error={listError}
            role={role}
            selectedId={selectedId}
            filters={filters}
            onSelect={select}
            onSort={(sort) => setFilters((f) => ({ ...f, sort, page: 1 }))}
            onPage={(page) => setFilters((f) => ({ ...f, page }))}
            onRetry={() => fetchList(false)}
          />

          {selectedId ? (
            <OrderDetail key={selectedId} orderId={selectedId} role={role} refreshKey={refreshKey} onChanged={onChanged} />
          ) : (
            <div className="lg:col-span-7 bg-surface-container-lowest p-space-xl text-center shadow-sm">
              <p className="font-body-sm text-body-sm text-on-surface-variant">Select an order to see its details.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}