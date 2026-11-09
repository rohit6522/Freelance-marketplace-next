"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function TagInput({ id, value, onChange, max, maxLength, placeholder }) {
  const [text, setText] = useState("");

  const add = (raw) => {
    const next = [...value];
    for (const part of raw.split(",")) {
      const tag = part.trim().slice(0, maxLength);
      if (!tag || next.length >= max) continue;
      if (!next.some((t) => t.toLowerCase() === tag.toLowerCase())) next.push(tag);
    }
    onChange(next);
    setText("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Backspace" && !text && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 border border-outline bg-surface-container-lowest p-space-xs focus-within:border-on-surface">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-surface-container border border-outline-variant font-code-sm text-code-sm px-2 py-0.5"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="hover:text-error"
            >
              <Icon name="close" className="text-[14px]" />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => text && add(text)}
          disabled={value.length >= max}
          maxLength={maxLength}
          placeholder={value.length >= max ? "Limit reached" : placeholder}
          className="flex-1 min-w-32 bg-transparent px-1 py-1 font-body-sm text-body-sm focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
      <p className="font-code-sm text-code-sm text-on-surface-variant mt-1">
        {value.length}/{max} · press Enter or comma to add
      </p>
    </div>
  );
}