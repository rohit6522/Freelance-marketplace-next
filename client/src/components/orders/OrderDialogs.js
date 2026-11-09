"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import { FormAlert } from "@/components/auth/FormParts";
import * as uploadService from "@/services/uploadService";
import { formatBytes } from "@/lib/orders";
import { cn } from "@/lib/utils";

function DialogHeader({ title, onClose, eyebrow }) {
  return (
    <div className="flex items-start justify-between gap-space-sm border-b-2 border-on-surface pb-space-sm mb-space-md">
      <div className="min-w-0">
        {eyebrow && <span className="font-code-sm text-code-sm text-primary uppercase font-bold block">{eyebrow}</span>}
        <h3 id="dialog-title" className="font-headline-md text-headline-md font-bold text-on-surface uppercase">
          {title}
        </h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="w-8 h-8 border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-white shrink-0"
      >
        <Icon name="close" className="text-[18px]" />
      </button>
    </div>
  );
}

const textareaClass =
  "w-full border border-outline bg-surface-container-lowest p-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-on-surface";

const primaryBtn =
  "px-space-lg py-2 font-label-sm text-label-sm uppercase font-bold border disabled:opacity-75 disabled:cursor-not-allowed";

/* ------------------------------ Confirm ------------------------------ */

function ConfirmBody({ title, description, confirmLabel, danger, textLabel, textMin, textMax, textPlaceholder, onConfirm, onClose }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (textLabel && textMin > 0 && value.length < textMin) {
      setError(`Please enter at least ${textMin} characters.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onConfirm(value);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-space-lg">
      <DialogHeader title={title} onClose={onClose} />
      {description && <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">{description}</p>}

      {textLabel && (
        <div className="mb-space-md">
          <label htmlFor="dialog-text" className="block font-label-sm text-label-sm uppercase text-on-surface mb-1">
            {textLabel}
            {textMin === 0 && <span className="text-on-surface-variant normal-case"> (optional)</span>}
          </label>
          <textarea
            id="dialog-text"
            rows={4}
            maxLength={textMax}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={textPlaceholder}
            className={textareaClass}
          />
        </div>
      )}

      {error && <FormAlert variant="error" className="mb-space-md">{error}</FormAlert>}

      <div className="flex justify-end gap-space-sm">
        <button
          type="button"
          onClick={onClose}
          className="px-space-md py-2 border border-outline text-on-surface uppercase font-label-sm text-label-sm hover:bg-surface-container"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className={cn(
            primaryBtn,
            danger ? "bg-error text-on-error border-error" : "bg-primary text-on-primary border-primary hover:bg-primary-container"
          )}
        >
          {busy ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </form>
  );
}

export function ConfirmDialog({ open, onClose, ...rest }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="dialog-title" className="max-w-md">
      <ConfirmBody textMin={0} textMax={500} {...rest} onClose={onClose} />
    </Modal>
  );
}

/* ------------------------------ Deliver ------------------------------ */

function DeliverBody({ revision, onSubmit, onClose }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = (e) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    const problem = uploadService.validateFiles(picked, files.length);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setFiles((current) => [...current, ...picked]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError("Please add a delivery note (at least 5 characters).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let uploaded = [];
      if (files.length > 0) uploaded = (await uploadService.uploadFiles(files)).data.files;
      await onSubmit({ message: message.trim(), files: uploaded });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-space-lg">
      <DialogHeader
        title={revision ? "Deliver revision" : "Deliver work"}
        eyebrow="DELIVERY // CLIENT WILL BE NOTIFIED IN CHAT"
        onClose={onClose}
      />

      <div className="mb-space-md">
        <label htmlFor="deliver-note" className="block font-label-sm text-label-sm uppercase text-on-surface mb-1">
          Delivery note <span className="text-primary font-bold">*</span>
        </label>
        <textarea
          id="deliver-note"
          rows={4}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Summarise what you are delivering and how to use it..."
          className={textareaClass}
        />
      </div>

      <div className="mb-space-md">
        <span className="block font-label-sm text-label-sm uppercase text-on-surface mb-1">
          Files <span className="text-on-surface-variant normal-case">(optional, up to 5, 10 MB each: JPG, PNG, WebP, PDF, ZIP)</span>
        </span>
        <label className="inline-flex items-center gap-1 px-space-md py-2 bg-surface-container-low border border-outline-variant font-label-sm text-label-sm uppercase font-bold cursor-pointer hover:bg-surface-container">
          <Icon name="attach_file" className="text-body-sm" />
          Choose files
          <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.zip" onChange={pick} className="sr-only" />
        </label>

        {files.length > 0 && (
          <ul className="mt-space-sm space-y-1">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-space-sm bg-surface-container-low px-space-sm py-1 font-code-sm text-code-sm"
              >
                <span className="truncate">
                  {file.name} <span className="text-on-surface-variant">({formatBytes(file.size)})</span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  className="text-on-surface-variant hover:text-error"
                >
                  <Icon name="close" className="text-[16px]" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <FormAlert variant="error" className="mb-space-md">{error}</FormAlert>}

      <div className="flex justify-end gap-space-sm">
        <button
          type="button"
          onClick={onClose}
          className="px-space-md py-2 border border-outline text-on-surface uppercase font-label-sm text-label-sm hover:bg-surface-container"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className={cn(primaryBtn, "bg-primary text-on-primary border-primary hover:bg-primary-container")}
        >
          {busy ? (files.length ? "Uploading..." : "Delivering...") : "Submit Delivery"}
        </button>
      </div>
    </form>
  );
}

export function DeliverDialog({ open, onClose, ...rest }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="dialog-title" className="max-w-lg">
      <DeliverBody {...rest} onClose={onClose} />
    </Modal>
  );
}

/* ------------------------------ Review ------------------------------ */

function ReviewBody({ onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (rating < 1) return setError("Please choose a star rating.");
    if (comment.trim().length < 10) return setError("Please write at least 10 characters.");
    setBusy(true);
    setError("");
    try {
      await onSubmit({ rating, comment: comment.trim() });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-space-lg">
      <DialogHeader title="Rate this order" eyebrow="VERIFIED ORDER REVIEW" onClose={onClose} />

      <div className="mb-space-md">
        <span className="block font-label-sm text-label-sm uppercase text-on-surface mb-1">Your rating</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className="text-primary"
            >
              <Icon name="star" filled={n <= rating} className={cn("text-[32px]", n > rating && "text-outline-variant")} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-space-md">
        <label htmlFor="review-comment" className="block font-label-sm text-label-sm uppercase text-on-surface mb-1">
          Your review <span className="text-primary font-bold">*</span>
        </label>
        <textarea
          id="review-comment"
          rows={5}
          maxLength={1500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was the communication, quality and delivery?"
          className={textareaClass}
        />
        <span className="font-code-sm text-code-sm text-on-surface-variant">{comment.length}/1500</span>
      </div>

      {error && <FormAlert variant="error" className="mb-space-md">{error}</FormAlert>}

      <div className="flex justify-end gap-space-sm">
        <button
          type="button"
          onClick={onClose}
          className="px-space-md py-2 border border-outline text-on-surface uppercase font-label-sm text-label-sm hover:bg-surface-container"
        >
          Later
        </button>
        <button
          type="submit"
          disabled={busy}
          className={cn(primaryBtn, "bg-primary text-on-primary border-primary hover:bg-primary-container")}
        >
          {busy ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}

export function ReviewDialog({ open, onClose, ...rest }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="dialog-title" className="max-w-lg">
      <ReviewBody {...rest} onClose={onClose} />
    </Modal>
  );
}