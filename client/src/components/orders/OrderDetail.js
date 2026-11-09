"use client";

import { useEffect, useState } from "react";
import OrderHeader from "./OrderHeader";
import MilestoneTracker from "./MilestoneTracker";
import Deliverables from "./Deliverables";
import OrderChat from "./OrderChat";
import OrderActions from "./OrderActions";
import * as orderService from "@/services/orderService";

// Parent ise key={orderId} ke saath use karta hai, isliye order badalne par ye naya shuru hota hai
export default function OrderDetail({ orderId, role, refreshKey, onChanged }) {
  const [state, setState] = useState({ phase: "loading", data: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    orderService
      .get(orderId)
      .then((res) => {
        if (!cancelled) setState({ phase: "ready", data: res.data, error: "" });
      })
      .catch((err) => {
        if (!cancelled) setState((s) => ({ phase: s.data ? "ready" : "error", data: s.data, error: err.message }));
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, refreshKey]);

  if (state.phase === "loading") {
    return (
      <div id="order-detail" className="lg:col-span-7 flex flex-col gap-space-md" aria-busy="true">
        {[40, 56, 32].map((h) => (
          <div key={h} className="bg-surface-container-lowest animate-pulse" style={{ height: `${h * 4}px` }} />
        ))}
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div id="order-detail" className="lg:col-span-7 bg-error-container text-on-error-container p-space-lg">
        <p className="font-headline-sm text-headline-sm uppercase">Order unavailable</p>
        <p className="font-body-sm text-body-sm mt-1">
          {state.error || "This order was not found or you do not have access to it."}
        </p>
      </div>
    );
  }

  const { order, payment } = state.data;

  return (
    <div id="order-detail" className="lg:col-span-7 flex flex-col gap-space-md">
      <OrderHeader order={order} payment={payment} role={role} />
      <MilestoneTracker order={order} role={role} onChanged={onChanged} />
      <Deliverables order={order} />
      <OrderChat
        order={order}
        refreshKey={refreshKey}
        actions={<OrderActions order={order} payment={payment} role={role} onChanged={onChanged} />}
      />
    </div>
  );
}