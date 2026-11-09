"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as favoriteService from "@/services/favoriteService";

export const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { status, user } = useAuth();
  const [ids, setIds] = useState(() => new Set());
  const isClient = status === "authenticated" && user?.role === "client";

  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;

    favoriteService
      .getIds()
      .then((res) => {
        if (!cancelled) setIds(new Set(res.data.gigIds));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  const toggle = useCallback(
    async (gigId) => {
      const wasSaved = ids.has(gigId);
      const apply = (saved) =>
        setIds((prev) => {
          const next = new Set(prev);
          if (saved) next.add(gigId);
          else next.delete(gigId);
          return next;
        });

      apply(!wasSaved); // turant dikhao
      try {
        if (wasSaved) await favoriteService.remove(gigId);
        else await favoriteService.add(gigId);
      } catch (err) {
        apply(wasSaved); // fail hua, wapas
        throw err;
      }
      return !wasSaved;
    },
    [ids]
  );

  const value = useMemo(
    () => ({ isSaved: (id) => isClient && ids.has(id), toggle }),
    [ids, isClient, toggle]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}