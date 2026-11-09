"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

export default function FavoriteButton({ gigId, variant = "card" }) {
  const { status, user } = useAuth();
  const { isSaved, toggle } = useFavorites();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(gigId);

  const onClick = async () => {
    if (status === "unauthenticated") {
      const next = window.location.pathname + window.location.search;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (status !== "authenticated" || busy) return;
    if (user.role !== "client") {
      toast.info("Only client accounts can save gigs.", { id: "fav-role" });
      return;
    }

    setBusy(true);
    try {
      const nowSaved = await toggle(gigId);
      toast.success(nowSaved ? "Saved to your gigs" : "Removed from saved gigs", { id: "fav-toast" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className="flex-1 sm:flex-initial bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-wider px-space-md py-2.5 hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1 font-bold"
      >
        <Icon name="bookmark" filled={saved} className="text-body-md" />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved gigs" : "Save gig"}
      className={cn(
        "absolute top-2 right-2 w-8 h-8 border flex items-center justify-center transition-colors",
        saved
          ? "bg-error text-on-error border-error"
          : "bg-surface-container-lowest text-on-surface border-on-surface hover:bg-error hover:text-on-error hover:border-error"
      )}
    >
      <Icon name="favorite" filled={saved} className="text-[18px]" />
    </button>
  );
}