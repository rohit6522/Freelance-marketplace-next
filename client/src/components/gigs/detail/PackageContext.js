"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const PackageContext = createContext(null);
const TIER_ORDER = ["basic", "standard", "premium"];

export function PackageProvider({ packages, gigId, sellerId, children }) {
  const available = useMemo(() => TIER_ORDER.filter((t) => packages?.[t]), [packages]);
  const [tier, setTier] = useState(available.includes("standard") ? "standard" : available[0]);

  const select = useCallback((next, { scroll = false } = {}) => {
    setTier(next);
    if (scroll) document.getElementById("buy-box")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = useMemo(
    () => ({ packages, available, tier, select, gigId, sellerId }),
    [packages, available, tier, select, gigId, sellerId]
  );

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
}

export function usePackages() {
  const ctx = useContext(PackageContext);
  if (!ctx) throw new Error("usePackages must be used inside <PackageProvider>");
  return ctx;
}