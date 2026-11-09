"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

function SearchBarView({ variant, value = "", onChange, onSubmit }) {
  const isMobile = variant === "mobile";

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn(
        "items-center border border-outline bg-surface-container-lowest",
        isMobile ? "flex w-full md:hidden" : "hidden md:flex"
      )}
    >
      <Icon name="search" className="text-outline px-space-xs text-body-md" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search services, talent, or gigs..."
        aria-label="Search gigs"
        maxLength={100}
        className={cn(
          "bg-transparent text-on-surface placeholder:text-outline-variant font-body-sm text-body-sm px-space-xs py-1.5 focus:outline-none",
          isMobile ? "flex-1 min-w-0" : "w-64 lg:w-80"
        )}
      />
      <button
        type="submit"
        className="bg-primary text-on-primary font-label-sm text-label-sm px-space-md py-1.5 border-l border-primary hover:bg-primary-container hover:text-on-primary-container transition-colors uppercase"
      >
        Search
      </button>
    </form>
  );
}

function SearchBarInner({ variant, onNavigate }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/gigs?${new URLSearchParams({ q }).toString()}` : "/gigs");
    onNavigate?.();
  };

  return (
    <SearchBarView
      variant={variant}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onSubmit={handleSubmit}
    />
  );
}

export default function SearchBar({ variant = "desktop", onNavigate }) {
  return (
    <Suspense fallback={<SearchBarView variant={variant} onSubmit={(e) => e.preventDefault()} />}>
      <SearchBarInner variant={variant} onNavigate={onNavigate} />
    </Suspense>
  );
}