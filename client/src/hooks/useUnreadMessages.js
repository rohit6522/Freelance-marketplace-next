"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as messageService from "@/services/messageService";

export function useUnreadMessages(enabled) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await messageService.getUnreadCount();
        if (!cancelled) setCount(res.data.unread);
      } catch {
        // navbar badge ke liye error dikhana zaroori nahi
      }
    };

    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled, pathname]);

  return enabled ? count : 0;
}