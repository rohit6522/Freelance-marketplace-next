"use client";

import Icon from "@/components/ui/Icon";
import { useBrowse } from "./BrowseContext";
import { SORT_OPTIONS, buildGigsHref } from "@/lib/gigParams";

export default function SortSelect({ params }) {
  const { go } = useBrowse();

  return (
    <div className="flex items-center gap-space-sm self-start md:self-auto">
      <div className="flex items-center bg-surface-container-lowest border border-on-surface">
        <label
          htmlFor="sortSelect"
          className="bg-surface-container-high px-space-sm py-2 font-label-sm text-label-sm text-on-surface uppercase border-r border-on-surface"
        >
          Sort
        </label>
        <div className="relative">
          <select
            id="sortSelect"
            value={params.sort}
            onChange={(e) => go(buildGigsHref(params, { sort: e.target.value, page: 1 }))}
            className="appearance-none bg-surface-container-lowest text-on-surface font-label-sm text-label-sm py-2 pl-space-sm pr-8 focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon name="expand_more" className="absolute right-1.5 top-2 pointer-events-none text-body-sm text-on-surface" />
        </div>
      </div>
    </div>
  );
}