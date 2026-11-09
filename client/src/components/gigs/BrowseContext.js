"use client";

import { createContext, useCallback, useContext, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const BrowseContext = createContext(null);

export function BrowseProvider({ children }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const go = useCallback(
    (href) => startTransition(() => router.push(href, { scroll: false })),
    [router]
  );

  const value = useMemo(() => ({ go, pending }), [go, pending]);
  return <BrowseContext.Provider value={value}>{children}</BrowseContext.Provider>;
}

export function useBrowse() {
  const ctx = useContext(BrowseContext);
  if (!ctx) throw new Error("useBrowse must be used inside <BrowseProvider>");
  return ctx;
}

export function PendingFrame({ className, children }) {
  const { pending } = useBrowse();
  return (
    <div
      aria-busy={pending}
      className={cn(className, pending && "opacity-50 pointer-events-none transition-opacity")}
    >
      {children}
    </div>
  );
}