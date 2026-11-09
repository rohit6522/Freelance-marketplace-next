"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const IDS = ["section-gigs", "section-portfolio", "section-reviews", "section-history"];

export default function ProfileTabs({ counts }) {
  const [active, setActive] = useState(IDS[0]);

  const tabs = [
    { id: IDS[0], label: `Active Gigs (${counts.gigs})` },
    { id: IDS[1], label: `Portfolio & Case Studies (${counts.portfolio})` },
    { id: IDS[2], label: `Client Reviews (${counts.reviews})` },
    { id: IDS[3], label: "Work History" },
  ];

  useEffect(() => {
    const sections = IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const go = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="border-b-2 border-on-surface flex flex-wrap gap-0 bg-surface-container-low" role="tablist">
      {tabs.map((tab, index) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => go(tab.id)}
            className={cn(
              "py-3 px-space-md font-label-md text-label-md uppercase tracking-wider",
              index < tabs.length - 1 && "border-r",
              isActive
                ? "bg-on-surface text-surface border-on-surface"
                : "bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-container"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}