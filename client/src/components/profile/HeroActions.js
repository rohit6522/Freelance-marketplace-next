"use client";

import Link from "next/link";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "./ProfileContext";

export default function HeroActions({ freelancerId }) {
  const { user } = useAuth();
  const { requestContact } = useProfile();

  if (user?._id === freelancerId) {
    return (
      <div className="space-y-space-sm">
        <p className="font-body-sm text-body-sm text-on-surface-variant">This is how clients see your public profile.</p>
        <Link
          href="/dashboard/profile"
          className="w-full bg-primary-container text-white py-3 px-space-md font-label-md text-label-md uppercase tracking-wider border border-primary-container hover:bg-primary transition-none flex items-center justify-center gap-space-xs"
        >
          <Icon name="edit" className="text-[18px]" />
          Edit Profile
        </Link>
      </div>
    );
  }

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard.");
    } catch {
      toast.info(`Copy this link: ${url}`);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => requestContact()}
        className="w-full bg-primary-container text-white py-3 px-space-md font-label-md text-label-md uppercase tracking-wider border border-primary-container hover:bg-primary transition-none flex items-center justify-center gap-space-xs"
      >
        <Icon name="mail" className="text-[18px]" />
        Contact Seller
      </button>
      <button
        type="button"
        onClick={() => requestContact({ mode: "offer" })}
        className="w-full bg-surface-container-lowest text-on-surface py-3 px-space-md font-label-md text-label-md uppercase tracking-wider border border-on-surface hover:bg-surface-container-high transition-none flex items-center justify-center gap-space-xs"
      >
        <Icon name="receipt_long" className="text-[18px]" />
        Request Custom Offer
      </button>
      <div className="pt-space-xs">
        <button
          type="button"
          onClick={share}
          className="w-full bg-surface-container text-on-surface-variant py-2 px-space-sm font-label-sm text-label-sm uppercase border border-outline hover:text-on-surface hover:border-on-surface transition-none flex items-center justify-center gap-1"
        >
          <Icon name="share" className="text-[16px]" />
          Share Profile
        </button>
      </div>
    </>
  );
}