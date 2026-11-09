"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import * as conversationService from "@/services/conversationService";
import { cn } from "@/lib/utils";

export default function ContactButton({ gigId, sellerId, label, variant = "primary" }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (status === "unauthenticated") {
      const next = window.location.pathname + window.location.search;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (status !== "authenticated" || busy) return;
    if (user._id === sellerId) {
      toast.info("This is your own gig.", { id: "contact-own" });
      return;
    }
    if (user.role !== "client") {
      toast.info("Only client accounts can start a conversation. Freelancers reply from Messages.", { id: "contact-role" });
      return;
    }

    setBusy(true);
    try {
      const res = await conversationService.start({ gigId });
      router.push(`/messages?c=${res.data.conversation._id}`);
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "font-bold uppercase tracking-wider flex items-center justify-center gap-1 disabled:opacity-75",
        variant === "primary"
          ? "flex-1 sm:flex-initial bg-primary text-on-primary font-label-md text-label-md px-space-lg py-2.5 hover:bg-primary-container transition-colors"
          : "w-full bg-surface-container-highest text-on-surface font-label-md text-label-md py-space-md gap-2 hover:bg-on-surface hover:text-surface transition-colors"
      )}
    >
      <Icon name={variant === "primary" ? "mail" : "chat"} className={cn("text-body-md", busy && "animate-spin")} />
      {busy ? "Opening..." : label}
    </button>
  );
}