"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function Modal({ open, onClose, labelledBy, className, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-space-md bg-[rgba(11,28,48,0.75)]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          "w-full bg-surface-container-lowest border-2 border-on-surface max-h-[90vh] overflow-y-auto focus:outline-none",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}