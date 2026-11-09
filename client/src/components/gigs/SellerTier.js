import { SELLER_TIER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STYLES = {
  top_rated: "bg-on-surface text-surface-container-lowest",
  pro_verified: "bg-primary text-on-primary",
  level_2: "bg-surface-container-lowest text-on-surface border border-on-surface",
  rising_talent: "bg-surface-container-lowest text-on-surface border border-on-surface",
};

// Card ke image ke upar-left corner ka tier pill
export function SellerTierPill({ tier }) {
  if (!tier || !SELLER_TIER_LABELS[tier]) return null;
  return (
    <div
      className={cn(
        "absolute top-2 left-2 font-code-sm text-label-sm px-2 py-0.5 font-bold uppercase tracking-wider",
        STYLES[tier]
      )}
    >
      {SELLER_TIER_LABELS[tier]}
    </div>
  );
}