"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const STYLES = {
  checking: "bg-surface-container text-on-surface-variant",
  ok: "bg-primary-fixed text-on-primary-fixed",
  error: "bg-error-container text-on-error-container",
};

export default function ApiStatus() {
  const [state, setState] = useState({ status: "checking", message: "Checking API..." });

  useEffect(() => {
    let cancelled = false;
    api
      .get("/health")
      .then((res) => !cancelled && setState({ status: "ok", message: res.message }))
      .catch((err) => !cancelled && setState({ status: "error", message: err.message }));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span
      className={`inline-flex items-center gap-space-xs px-space-sm py-space-xs font-code-sm text-code-sm uppercase ${STYLES[state.status]}`}
    >
      <span className="w-2 h-2 bg-current" />
      {state.message}
    </span>
  );
}