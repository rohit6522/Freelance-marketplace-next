"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { FieldError } from "@/components/auth/FormParts";
import { useBrowse } from "./BrowseContext";
import { SELLER_TIER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  DELIVERY_OPTIONS,
  EXPERIENCE_OPTIONS,
  PRICE_PRESETS,
  RATING_OPTIONS,
  TIER_VALUES,
  buildGigsHref,
  clearedParams,
  getActivePills,
} from "@/lib/gigParams";

const checkboxClass = "w-[18px] h-[18px] border border-on-surface accent-primary rounded-none";
const radioClass = "w-[18px] h-[18px] border border-on-surface accent-on-surface rounded-none";

const presetClass = (active) =>
  cn(
    "py-1 px-2 text-center font-code-sm text-code-sm border text-on-surface uppercase",
    active
      ? "bg-surface-container-high border-on-surface font-semibold"
      : "bg-surface-container-low border-outline-variant hover:border-on-surface hover:bg-surface-container-high"
  );

function Section({ title, index, last = false, children }) {
  return (
    <div className={cn("pb-space-md", !last && "border-b border-outline-variant")}>
      <div className="flex items-center justify-between mb-space-sm">
        <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-bold">{title}</span>
        <span className="text-outline font-code-sm text-code-sm">[{index}]</span>
      </div>
      {children}
    </div>
  );
}

function RadioGroup({ name, options, value, onChange, renderLabel }) {
  return (
    <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label key={option.value || "any"} className="flex items-center gap-space-xs cursor-pointer group py-0.5">
            <input
              type="radio"
              name={name}
              className={radioClass}
              checked={selected}
              onChange={() => onChange(option.value)}
            />
            {renderLabel ? (
              renderLabel(option, selected)
            ) : (
              <span className={cn("group-hover:text-primary", selected && "font-medium")}>{option.label}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export default function FilterSidebar({ params, categories }) {
  const { go } = useBrowse();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    categories: params.categories,
    tiers: params.tiers,
    delivery: params.delivery,
    experience: params.experience,
    rating: params.rating,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
  });

  const activeCount = getActivePills(params).length;
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const toggle = (key, value) =>
    set({ [key]: draft[key].includes(value) ? draft[key].filter((v) => v !== value) : [...draft[key], value] });

  const onSubmit = (e) => {
    e.preventDefault();
    const min = draft.minPrice === "" ? null : Number(draft.minPrice);
    const max = draft.maxPrice === "" ? null : Number(draft.maxPrice);

    if ((min !== null && !(min >= 0)) || (max !== null && !(max >= 0))) {
      setError("Budget must be a positive number");
      return;
    }
    if (min !== null && max !== null && min > max) {
      setError("Min budget cannot be higher than Max");
      return;
    }

    setError("");
    go(buildGigsHref(params, { ...draft, page: 1 }));
    setOpen(false);
  };

  return (
    <aside className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant p-space-md">
      <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant mb-space-md">
        <div className="flex items-center gap-space-xs">
          <Icon name="tune" className="text-primary text-body-md" />
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface">Filters</h2>
        </div>
        <span className="font-code-sm text-code-sm bg-surface-container-high px-1.5 py-0.5 text-on-surface font-semibold">
          ACTIVE: {activeCount}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="lg:hidden w-full mb-space-md flex items-center justify-between px-space-sm py-2 bg-surface-container-low border border-outline-variant font-label-sm text-label-sm uppercase font-bold text-on-surface"
      >
        {open ? "Hide filters" : "Show filters"}
        <Icon name={open ? "expand_less" : "expand_more"} className="text-body-md" />
      </button>

      <form onSubmit={onSubmit} className={cn("space-y-space-md", open ? "block" : "hidden", "lg:block")}>
        {/* Service type */}
        <Section title="Service Type" index="01">
          <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface">
            {categories.map((category) => {
              const checked = draft.categories.includes(category.slug);
              return (
                <label key={category._id} className="flex items-center justify-between cursor-pointer group py-0.5">
                  <span className="flex items-center gap-space-xs">
                    <input
                      type="checkbox"
                      className={checkboxClass}
                      checked={checked}
                      onChange={() => toggle("categories", category.slug)}
                    />
                    <span className={cn("group-hover:text-primary", checked && "font-medium")}>{category.name}</span>
                  </span>
                  <span className="font-code-sm text-code-sm text-secondary">{category.gigCount}</span>
                </label>
              );
            })}
            {categories.length === 0 && <p className="text-on-surface-variant">Categories are unavailable right now.</p>}
          </div>
        </Section>

        {/* Delivery */}
        <Section title="Delivery Time" index="02">
          <RadioGroup
            name="delivery"
            options={DELIVERY_OPTIONS}
            value={draft.delivery}
            onChange={(value) => set({ delivery: value })}
          />
        </Section>

        {/* Budget */}
        <Section title="Budget (USD)" index="03">
          <div className="grid grid-cols-2 gap-space-xs mb-space-sm">
            {[
              ["Min", "minPrice", "budgetMin"],
              ["Max", "maxPrice", "budgetMax"],
            ].map(([label, key, id]) => (
              <div key={key}>
                <label htmlFor={id} className="block font-label-sm text-label-sm text-secondary uppercase mb-1">
                  {label}
                </label>
                <div className="flex items-center border border-outline bg-surface-container-lowest">
                  <span className="px-2 font-code-sm text-code-sm bg-surface-container-high text-on-surface border-r border-outline font-bold">
                    $
                  </span>
                  <input
                    id={id}
                    type="number"
                    min="0"
                    inputMode="decimal"
                    placeholder={key === "minPrice" ? "0" : "Any"}
                    value={draft[key]}
                    onChange={(e) => set({ [key]: e.target.value })}
                    className="w-full font-code-sm text-code-sm py-1.5 px-2 bg-transparent text-on-surface focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          <FieldError message={error} />
          <div className="grid grid-cols-2 gap-space-xs mt-space-xs">
            {PRICE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => set({ minPrice: preset.min, maxPrice: preset.max })}
                className={presetClass(draft.minPrice === preset.min && draft.maxPrice === preset.max)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Seller tier */}
        <Section title="Seller Tier" index="04">
          <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface">
            {TIER_VALUES.map((tier) => {
              const checked = draft.tiers.includes(tier);
              return (
                <label key={tier} className="flex items-center justify-between cursor-pointer group py-0.5">
                  <span className="flex items-center gap-space-xs">
                    <input
                      type="checkbox"
                      className={checkboxClass}
                      checked={checked}
                      onChange={() => toggle("tiers", tier)}
                    />
                    <span className={cn("group-hover:text-primary", checked && "font-medium")}>
                      {SELLER_TIER_LABELS[tier]}
                    </span>
                  </span>
                  {tier === "pro_verified" && (
                    <span className="bg-primary text-on-primary font-code-sm text-label-sm px-1 font-bold">PRO</span>
                  )}
                </label>
              );
            })}
          </div>
        </Section>

        {/* Rating */}
        <Section title="Review Score" index="05">
          <RadioGroup
            name="rating"
            options={RATING_OPTIONS}
            value={draft.rating}
            onChange={(value) => set({ rating: value })}
            renderLabel={(option, selected) =>
              option.value ? (
                <div className="flex items-center text-on-surface">
                  <Icon name="star" filled className="text-[16px] text-tertiary mr-1" />
                  <span className={cn(selected && "font-semibold")}>{option.label}</span>
                </div>
              ) : (
                <span className={cn("group-hover:text-primary", selected && "font-medium")}>{option.label}</span>
              )
            }
          />
        </Section>

        {/* Experience */}
        <Section title="Seller Experience" index="06" last>
          <RadioGroup
            name="experience"
            options={EXPERIENCE_OPTIONS}
            value={draft.experience}
            onChange={(value) => set({ experience: value })}
          />
        </Section>

        {/* Buttons */}
        <div className="pt-space-xs space-y-space-xs">
          <button
            type="submit"
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-2.5 uppercase tracking-wider font-bold border border-primary hover:bg-primary-container shadow-[2px_2px_0px_#0b1c30] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            Apply Filter State
          </button>
          <button
            type="button"
            onClick={() => go(buildGigsHref(clearedParams(params)))}
            className="w-full bg-surface-container-lowest text-on-surface font-label-md text-label-md py-2.5 uppercase tracking-wider font-bold border border-on-surface hover:bg-surface-container-high transition-colors"
          >
            Reset Parameters
          </button>
        </div>
      </form>
    </aside>
  );
}