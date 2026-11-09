"use client";

import { usePackages } from "./PackageContext";
import { formatPrice, cn } from "@/lib/utils";

const HEADINGS = { basic: "Basic Tier", standard: "Standard (Recommended)", premium: "Premium Tier" };

const deliveryText = (days) => `${days} ${days === 1 ? "Day" : "Days"}`;
const revisionText = (pkg) =>
  pkg.unlimitedRevisions ? "Unlimited" : `${pkg.revisions} ${pkg.revisions === 1 ? "Round" : "Rounds"}`;

export default function PackageTable() {
  const { packages, available, select } = usePackages();
  if (available.length === 0) return null;

  const features = [...new Set(available.flatMap((t) => packages[t].features ?? []))];

  const rows = [
    { label: "Delivery Time", type: "text", cells: available.map((t) => deliveryText(packages[t].deliveryDays)) },
    { label: "Revisions Included", type: "text", cells: available.map((t) => revisionText(packages[t])) },
    ...features.map((feature) => ({
      label: feature,
      type: "check",
      cells: available.map((t) => (packages[t].features ?? []).includes(feature)),
    })),
  ];

  const cellBg = (tier) => (tier === "standard" ? "bg-primary-fixed-dim/20" : "bg-surface-container");

  return (
    <section id="compare" className="bg-surface-container-lowest p-space-xl shadow-sm scroll-mt-28">
      <div className="mb-space-md">
        <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-xs inline-block">
          MODULE 03 // MATRIX SPECIFICATION
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Compare Packages</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-sm text-body-sm">
          <thead>
            <tr className="bg-surface-container-low text-on-surface uppercase font-label-sm text-label-sm">
              <th className="p-space-md">Technical Parameters</th>
              {available.map((tier) => (
                <th
                  key={tier}
                  className={cn(
                    "p-space-md",
                    tier === "standard" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container"
                  )}
                >
                  {HEADINGS[tier]}
                  <div
                    className={cn(
                      "font-headline-sm text-headline-sm font-bold mt-1",
                      tier === "standard" ? "text-on-primary-fixed" : "text-on-surface"
                    )}
                  >
                    {formatPrice(packages[tier].price)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.label}
                className={cn(
                  "hover:bg-surface-container-low transition-colors",
                  index % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container-low/40"
                )}
              >
                <td className="p-space-md font-bold text-on-surface">{row.label}</td>
                {row.cells.map((cell, i) => {
                  const tier = available[i];
                  if (row.type === "check") {
                    return (
                      <td
                        key={tier}
                        className={cn("p-space-md font-bold", cellBg(tier), cell ? "text-primary" : "text-outline-variant")}
                      >
                        {cell ? "✓ Included" : "—"}
                      </td>
                    );
                  }
                  return (
                    <td
                      key={tier}
                      className={cn(
                        "p-space-md",
                        cellBg(tier),
                        tier === "standard" ? "font-bold text-primary" : "text-on-surface-variant"
                      )}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-surface-container-low">
              <td className="p-space-md" />
              {available.map((tier) => (
                <td key={tier} className={cn("p-space-md", tier === "standard" ? "bg-primary-fixed" : "bg-surface-container")}>
                  <button
                    type="button"
                    onClick={() => select(tier, { scroll: true })}
                    className={cn(
                      "w-full font-label-sm text-label-sm uppercase py-2 font-bold transition-colors",
                      tier === "standard"
                        ? "bg-primary text-on-primary hover:bg-primary-container"
                        : "bg-surface-container-highest text-on-surface hover:bg-on-surface hover:text-surface"
                    )}
                  >
                    Select {tier[0].toUpperCase() + tier.slice(1)}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}