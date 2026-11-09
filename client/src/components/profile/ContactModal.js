"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import { FieldError, FormAlert } from "@/components/auth/FormParts";
import * as conversationService from "@/services/conversationService";
import { applyApiErrors } from "@/lib/forms";
import { cn } from "@/lib/utils";

const BUDGETS = ["Under $150", "$150 - $500", "$500+"];

const fieldClass = (hasError) =>
  cn(
    "w-full border bg-surface-container-lowest p-2 text-on-surface focus:outline-none focus:border-on-surface",
    hasError ? "border-error" : "border-outline"
  );

function ContactForm({ mode, topic, freelancer, gigs, onClose }) {
  const isOffer = mode === "offer";
  const [formErrors, setFormErrors] = useState([]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      focus: "general",
      budget: BUDGETS[1],
      brief: topic ? `I would like something similar to "${topic}". ` : "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setFormErrors([]);
    const gig = gigs.find((g) => g.id === values.focus);

    try {
      const started = await conversationService.start(gig ? { gigId: gig.id } : { freelancerId: freelancer.id });

      const text = [
        isOffer ? "[Custom offer request]" : null,
        `Focus: ${gig ? gig.title : "General inquiry"}`,
        `Estimated budget: ${values.budget}`,
        "",
        values.brief.trim(),
      ]
        .filter((line) => line !== null)
        .join("\n");

      await conversationService.sendMessage(started.data.conversation._id, { text });
      toast.success(`Message sent to ${freelancer.name}.`);
      onClose();
    } catch (err) {
      setFormErrors(applyApiErrors(err, setError, { text: "brief" }));
    }
  };

  return (
    <div className="p-space-lg">
      <div className="flex items-center justify-between border-b-2 border-on-surface pb-space-sm mb-space-md gap-space-sm">
        <div className="min-w-0">
          <span className="font-code-sm text-code-sm text-primary uppercase font-bold">
            DIRECT MESSAGE // DEMO ESCROW
          </span>
          <h3 id="contact-title" className="font-headline-md text-headline-md font-bold text-on-surface uppercase">
            {isOffer ? "Request a custom offer" : `Message ${freelancer.name}`}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-white transition-none shrink-0"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md font-body-sm text-body-sm">
        <div>
          <label htmlFor="contact-focus" className="block font-label-sm text-label-sm uppercase text-on-surface mb-1">
            Contract Focus Area
          </label>
          <select id="contact-focus" className={fieldClass(false)} {...register("focus")}>
            <option value="general">General inquiry</option>
            {gigs.map((gig) => (
              <option key={gig.id} value={gig.id}>
                {gig.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block font-label-sm text-label-sm uppercase text-on-surface mb-1">
            Estimated Budget Range (USD)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {BUDGETS.map((budget) => (
              <label
                key={budget}
                className="border border-outline p-2 text-center text-code-sm cursor-pointer hover:bg-surface-container flex items-center justify-center"
              >
                <input type="radio" value={budget} className="mr-1 accent-primary" {...register("budget")} />
                {budget}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="contact-brief" className="block font-label-sm text-label-sm uppercase text-on-surface mb-1">
            Project Brief / Specification
          </label>
          <textarea
            id="contact-brief"
            rows={4}
            maxLength={1500}
            placeholder="Briefly describe your objectives, stack, target delivery date and any references..."
            aria-invalid={errors.brief ? "true" : undefined}
            className={fieldClass(errors.brief)}
            {...register("brief", {
              required: "Please describe what you need",
              validate: (v) => v.trim().length >= 10 || "Brief must be at least 10 characters",
            })}
          />
          <FieldError message={errors.brief?.message} />
        </div>

        <div className="bg-surface-container-low p-2 border border-outline-variant font-code-sm text-[11px] text-on-surface-variant flex items-start gap-1.5">
          <Icon name="lock" className="text-[16px] text-primary" />
          <span>
            Your message goes to the seller&apos;s inbox. Order payments use a simulated escrow released milestone by
            milestone.
          </span>
        </div>

        {formErrors.length > 0 && (
          <FormAlert variant="error">
            {formErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </FormAlert>
        )}

        <div className="flex items-center justify-end gap-space-sm pt-space-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 border border-outline text-on-surface uppercase font-label-sm text-label-sm hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-space-lg py-2 bg-primary-container text-white uppercase font-label-sm text-label-sm hover:bg-primary border border-primary-container disabled:opacity-75"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ContactModal({ open, mode, topic, freelancer, gigs, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="contact-title" className="max-w-lg">
      <ContactForm mode={mode} topic={topic} freelancer={freelancer} gigs={gigs} onClose={onClose} />
    </Modal>
  );
}