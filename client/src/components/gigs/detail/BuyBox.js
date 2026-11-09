"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { usePackages } from "./PackageContext";
import { formatPrice, cn } from "@/lib/utils";

export default function BuyBox() {
  const { packages, available, tier, select, gigId, sellerId } = usePackages();
  const { status, user } = useAuth();
  const pkg = packages?.[tier];

  if (!pkg) {
    return (
      <div id="buy-box" className="bg-surface-container-lowest p-space-lg shadow-sm">
        <p className="font-body-sm text-body-sm text-on-surface-variant">Packages have not been set up for this gig yet.</p>
      </div>
    );
  }

  const isOwner = Boolean(user) && user._id === sellerId;
  const wrongRole = status === "authenticated" && user.role !== "client";
  const blockedText = isOwner
    ? "This is your own gig. You cannot order it."
    : wrongRole
      ? "Only client accounts can place orders."
      : null;

  const checkoutHref = `/checkout?gig=${gigId}&tier=${tier}`;
  const href = status === "unauthenticated" ? `/login?next=${encodeURIComponent(checkoutHref)}` : checkoutHref;

  return (
    <div id="buy-box" className="bg-surface-container-lowest p-space-lg shadow-sm scroll-mt-28">
      {/* Tier tabs */}
      <div className="grid grid-cols-3 bg-surface-container mb-space-md">
        {available.map((key) => {
          const active = key === tier;
          return (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              aria-pressed={active}
              className={cn(
                "py-space-sm px-1 text-center font-label-sm text-label-sm font-bold uppercase transition-colors",
                active ? "bg-surface-container-lowest text-primary" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {key}
              <span className={cn("block font-code-sm text-code-sm", active ? "text-primary font-bold" : "text-on-surface")}>
                {formatPrice(packages[key].price)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active package */}
      <div className="mb-space-lg">
        <div className="flex items-baseline justify-between gap-space-sm mb-space-xs">
          <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase font-bold">{pkg.name} Package</h3>
          <span className="font-headline-lg text-headline-lg text-primary font-bold">{formatPrice(pkg.price)}</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">{pkg.description}</p>

        <div className="bg-surface-container-low p-space-md space-y-space-xs mb-space-md font-body-sm text-body-sm">
          <div className="flex items-center justify-between text-on-surface">
            <span className="flex items-center gap-1.5 font-bold uppercase text-label-sm">
              <Icon name="schedule" className="text-body-md text-primary" />
              Delivery Time
            </span>
            <span className="font-code-sm text-code-sm font-bold">
              {pkg.deliveryDays} {pkg.deliveryDays === 1 ? "Day" : "Days"}
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface">
            <span className="flex items-center gap-1.5 font-bold uppercase text-label-sm">
              <Icon name="sync" className="text-body-md text-primary" />
              Revisions
            </span>
            <span className="font-code-sm text-code-sm font-bold">
              {pkg.unlimitedRevisions ? "Unlimited Rounds" : `${pkg.revisions} ${pkg.revisions === 1 ? "Round" : "Rounds"}`}
            </span>
          </div>
        </div>

        {(pkg.features ?? []).length > 0 && (
          <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface mb-space-lg">
            {pkg.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="w-4 h-4 bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm shrink-0">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* CTAs */}
        <div className="space-y-space-sm">
          {blockedText ? (
            <div
              aria-disabled="true"
              className="w-full bg-surface-container text-on-surface-variant font-label-md text-label-md py-space-md text-center border border-outline-variant"
            >
              {blockedText}
            </div>
          ) : (
            <Link
              href={href}
              className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider py-space-md font-bold hover:bg-primary-container transition-colors shadow-sm text-center flex items-center justify-center gap-2"
            >
              Continue ({formatPrice(pkg.price)})
              <Icon name="arrow_forward" className="text-headline-sm" />
            </Link>
          )}
          <a
            href="#compare"
            className="block w-full bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-wider py-space-sm font-bold hover:bg-surface-container-highest transition-colors text-center"
          >
            Compare Packages
          </a>
        </div>

        <div className="mt-space-md bg-surface-container-low p-space-sm text-center font-code-sm text-code-sm text-on-surface-variant uppercase font-bold">
          <span className="text-primary font-bold">DEMO ESCROW (SIMULATED)</span> 
        </div>
      </div>
    </div>
  );
}