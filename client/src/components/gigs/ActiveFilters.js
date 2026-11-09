"use client";

import Icon from "@/components/ui/Icon";
import { useBrowse } from "./BrowseContext";
import { buildGigsHref, clearedParams, getActivePills } from "@/lib/gigParams";

export default function ActiveFilters({ params, categoryNames }) {
  const { go } = useBrowse();
  const pills = getActivePills(params, categoryNames);

  return (
    <section className="w-full bg-surface-container-low border-b border-outline-variant py-space-sm">
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mr-space-xs">
            Active Criteria:
          </span>

          {pills.length === 0 && (
            <span className="font-code-sm text-code-sm text-on-surface-variant">NONE // SHOWING ALL GIGS</span>
          )}

          {pills.map((pill) => (
            <div
              key={pill.key}
              className="inline-flex items-center bg-surface-container-lowest border border-on-surface px-space-sm py-1 shadow-[2px_2px_0px_#0b1c30]"
            >
              <span className="font-code-sm text-code-sm text-on-surface mr-space-xs font-semibold">{pill.label}</span>
              <button
                type="button"
                aria-label={`Remove ${pill.label}`}
                onClick={() => go(buildGigsHref(params, { ...pill.remove, page: 1 }))}
                className="text-on-surface hover:text-error transition-colors flex items-center"
              >
                <Icon name="close" className="text-[14px]" />
              </button>
            </div>
          ))}

          {pills.length > 0 && (
            <button
              type="button"
              onClick={() => go(buildGigsHref(clearedParams(params)))}
              className="font-label-sm text-label-sm text-primary hover:text-primary-container uppercase font-bold underline ml-space-xs"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-space-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Simulated Escrow Checkout</span>
          <div className="w-2 h-2 bg-primary" />
        </div>
      </div>
    </section>
  );
}