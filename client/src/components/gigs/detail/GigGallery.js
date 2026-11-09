"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export default function GigGallery({ images = [], title }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;

  const current = images[active] ?? images[0];

  return (
    <div className="bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex items-center gap-1 bg-surface-container-low p-1 mb-space-md overflow-x-auto">
        <span className="bg-surface-container-lowest text-primary font-label-sm text-label-sm uppercase px-space-md py-2 font-bold whitespace-nowrap">
          01 // GIG SHOWCASE
        </span>
      </div>

      <div className="relative w-full aspect-[16/10] bg-surface-container overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w-full h-full object-cover" src={current.url} alt={`${title} - image ${active + 1}`} />
        <div className="absolute top-4 left-4 bg-on-surface text-surface font-code-sm text-code-sm px-2 py-1 uppercase tracking-wider font-bold">
          IMAGE {active + 1} / {images.length}
        </div>
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-surface-container-lowest text-on-surface px-3 py-1.5 flex items-center gap-2 font-label-sm text-label-sm font-bold shadow-sm hover:bg-surface-container-low"
        >
          <Icon name="visibility" className="text-body-sm text-primary" />
          VIEW FULL SIZE
        </a>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-space-sm mt-space-md">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "p-1 cursor-pointer",
                index === active ? "bg-surface-container-highest" : "bg-surface-container hover:bg-surface-container-high"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-full h-16 object-cover" src={image.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}