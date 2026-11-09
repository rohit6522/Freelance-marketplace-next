"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import * as uploadService from "@/services/uploadService";
import { cn } from "@/lib/utils";

const IS_DEV = process.env.NODE_ENV !== "production";

export default function ImageUploader({ value, onChange, max, onRemoveSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (e) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;

    const problem = uploadService.validateImages(picked, value.length, max);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await uploadService.uploadImages(picked);
      const added = res.data.files.map((f) => ({ url: f.url, publicId: f.publicId, isNew: true }));
      onChange([...value, ...added]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Sirf development me: Cloudinary ke bina test karne ke liye
  const addSample = () => {
    if (value.length >= max) return;
    const seed = Math.random().toString(16).slice(2, 10);
    onChange([...value, { url: `https://picsum.photos/seed/${seed}/800/500` }]);
  };

  const remove = (index) => {
    const item = value[index];
    onChange(value.filter((_, i) => i !== index));
    if (item.publicId) {
      if (item.isNew) uploadService.deleteUpload(item.publicId).catch(() => {});
      else onRemoveSaved?.(item);
    }
  };

  const makeCover = (index) => onChange([value[index], ...value.filter((_, i) => i !== index)]);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-space-sm">
        {value.map((image, index) => (
          <div key={image.url} className="relative bg-surface-container border border-outline-variant">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-24 object-cover" src={image.url} alt={`Image ${index + 1}`} />
            {index === 0 && (
              <span className="absolute top-1 left-1 bg-on-surface text-surface font-code-sm text-[10px] px-1 uppercase font-bold">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove image ${index + 1}`}
              className="absolute top-1 right-1 w-6 h-6 bg-surface-container-lowest border border-on-surface flex items-center justify-center hover:bg-error hover:text-on-error hover:border-error"
            >
              <Icon name="close" className="text-[14px]" />
            </button>
            {index > 0 && (
              <button
                type="button"
                onClick={() => makeCover(index)}
                className="w-full bg-surface-container-low font-code-sm text-[11px] uppercase py-1 hover:bg-surface-container"
              >
                Make cover
              </button>
            )}
          </div>
        ))}

        {value.length < max && (
          <label
            className={cn(
              "h-24 border-2 border-dashed border-outline flex flex-col items-center justify-center gap-1 cursor-pointer text-on-surface-variant hover:border-on-surface hover:text-on-surface transition-colors",
              busy && "opacity-60 pointer-events-none"
            )}
          >
            <Icon name={busy ? "sync" : "add_photo_alternate"} className={cn("text-[24px]", busy && "animate-spin")} />
            <span className="font-code-sm text-[11px] uppercase">{busy ? "Uploading..." : "Add image"}</span>
            <input type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={pick} className="sr-only" />
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm mt-space-xs">
        <p className="font-code-sm text-code-sm text-on-surface-variant">
          {value.length}/{max} images · JPG, PNG or WebP, up to 5 MB each · first image is the cover
        </p>
        {IS_DEV && value.length < max && (
          <button
            type="button"
            onClick={addSample}
            className="font-code-sm text-code-sm uppercase text-primary font-bold hover:underline"
          >
            + Add sample image (dev only)
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="font-body-sm text-body-sm text-error mt-1">
          {error}
        </p>
      )}
    </div>
  );
}