"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export default function FaqAccordion({ items }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-space-sm">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question} className="bg-surface-container-low">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
              className="w-full text-left p-space-md flex items-center justify-between gap-space-sm font-headline-sm text-headline-sm text-on-surface font-bold hover:bg-surface-container transition-colors"
            >
              <span>{item.question}</span>
              <Icon name="expand_more" className={cn("transform transition-transform text-primary", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="p-space-md pt-0 font-body-md text-body-md text-on-surface-variant">{item.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}