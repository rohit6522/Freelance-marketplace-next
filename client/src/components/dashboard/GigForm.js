"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { get, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { FormAlert } from "@/components/auth/FormParts";
import ImageUploader from "./ImageUploader";
import TagInput from "./TagInput";
import { Field, Section, inputClass } from "./FormKit";
import { PageHeader } from "./DashboardParts";
import * as gigService from "@/services/gigService";
import * as uploadService from "@/services/uploadService";
import { TIERS, TIER_TITLES, buildGigPayload, defaultGigValues, gigToFormValues } from "@/lib/gigForm";
import { cn } from "@/lib/utils";

const KNOWN_FIELDS = /^(title|category|description|(basic|standard|premium)\.(name|description|price|deliveryDays|revisions|featuresText))$/;

export default function GigForm({ gig = null, categories }) {
  const router = useRouter();
  const isEdit = Boolean(gig);
  const [status, setStatus] = useState(gig?.status ?? "draft");
  const [tags, setTags] = useState(gig?.tags ?? []);
  const [images, setImages] = useState((gig?.images ?? []).map((i) => ({ url: i.url, publicId: i.publicId })));
  const [removedSaved, setRemovedSaved] = useState([]);
  const [problems, setProblems] = useState([]);
  const [saving, setSaving] = useState(null);
  const alertRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues: gig ? gigToFormValues(gig) : defaultGigValues() });

  const deliverables = useFieldArray({ control, name: "deliverables" });
  const faqs = useFieldArray({ control, name: "faqs" });
  const fieldError = (path) => get(errors, path)?.message;
  const descriptionLength = watch("description")?.length ?? 0;

  const showProblems = (messages) => {
    setProblems([...new Set(messages)]);
    setTimeout(() => alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const save = (intent) =>
    handleSubmit(async (values) => {
      clearErrors();
      setProblems([]);

      const wantPublish = intent === "publish" || (isEdit && status === "published");
      const { payload, problems: found } = buildGigPayload(values, { tags, images, publish: wantPublish });

      if (found.length > 0) {
        found.forEach((p) => p.field && setError(p.field, { type: "manual", message: p.message }));
        showProblems(found.map((p) => p.message));
        return;
      }

      setSaving(intent);
      try {
        if (isEdit) {
          await gigService.update(gig._id, payload);
          if (intent === "publish" && status !== "published") {
            await gigService.setStatus(gig._id, "published");
            setStatus("published");
          }
          // Save ho gaya: hataai hui purani images ab Cloudinary se bhi hata do
          removedSaved.forEach((image) => uploadService.deleteUpload(image.publicId).catch(() => {}));
          setRemovedSaved([]);
          setImages((current) => current.map((i) => ({ ...i, isNew: false })));
          toast.success(intent === "publish" ? "Gig published" : "Changes saved");
        } else {
          await gigService.create({ ...payload, status: intent === "publish" ? "published" : "draft" });
          toast.success(intent === "publish" ? "Gig published" : "Gig saved as draft");
          router.push("/dashboard/gigs");
        }
      } catch (err) {
        const details = err.details ?? [];
        details.forEach((d) => {
          const field = d.field?.startsWith("packages.") ? d.field.slice(9) : d.field;
          if (field && KNOWN_FIELDS.test(field)) setError(field, { type: "server", message: d.message });
        });
        showProblems(details.length > 0 ? details.map((d) => d.message) : [err.message]);
      } finally {
        setSaving(null);
      }
    });

  const busy = saving !== null;

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-space-lg">
      <PageHeader
        eyebrow="DASHBOARD // FREELANCER"
        title={isEdit ? "Edit Gig" : "Create Gig"}
        subtitle={
          isEdit
            ? `Status: ${status}. Changes to a published gig go live immediately.`
            : "Start with a draft. You can publish once the description, an image and all three packages are complete."
        }
        action={
          isEdit ? (
            <Link
              href={`/gigs/${gig.slug}`}
              target="_blank"
              className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm px-space-md py-2.5 flex items-center gap-1 uppercase font-bold"
            >
              <Icon name="visibility" className="text-body-md" />
              {status === "published" ? "View live" : "Preview"}
            </Link>
          ) : undefined
        }
      />

      {problems.length > 0 && (
        <div ref={alertRef}>
          <FormAlert variant="error">
            <p className="font-bold mb-1">Please fix the following:</p>
            <ul className="list-disc pl-5">
              {problems.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </FormAlert>
        </div>
      )}

      {/* Basics */}
      <Section eyebrow="01 // BASICS" title="Overview">
        <Field label="Gig title" htmlFor="gig-title" required hint="Start with “I will...”. 10 to 120 characters." error={fieldError("title")}>
          <input
            id="gig-title"
            type="text"
            maxLength={120}
            placeholder="I will design a conversion-focused landing page in Figma"
            className={inputClass(fieldError("title"))}
            {...register("title")}
          />
        </Field>

        <Field label="Category" htmlFor="gig-category" required error={fieldError("category")}>
          <select id="gig-category" className={inputClass(fieldError("category"))} {...register("category")}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Search tags" htmlFor="gig-tags" hint="Up to 5 tags, 30 characters each. Buyers search by these.">
          <TagInput id="gig-tags" value={tags} onChange={setTags} max={5} maxLength={30} placeholder="e.g. Figma, SaaS, UI/UX" />
        </Field>
      </Section>

      {/* Images */}
      <Section eyebrow="02 // GALLERY" title="Images" description="Upload up to 5 images. The first one is the cover shown on cards.">
        <ImageUploader value={images} onChange={setImages} max={5} onRemoveSaved={(image) => setRemovedSaved((r) => [...r, image])} />
      </Section>

      {/* Description */}
      <Section eyebrow="03 // DESCRIPTION" title="About this gig">
        <Field
          label="Description"
          htmlFor="gig-description"
          hint={`${descriptionLength}/5000 · at least 50 characters to publish. Use a blank line to start a new paragraph.`}
          error={fieldError("description")}
        >
          <textarea
            id="gig-description"
            rows={8}
            maxLength={5000}
            placeholder="Describe what you deliver, your process and what you need from the buyer..."
            className={inputClass(fieldError("description"))}
            {...register("description")}
          />
        </Field>
      </Section>

      {/* Packages */}
      <Section
        eyebrow="04 // PACKAGES"
        title="Pricing & packages"
        description="Buyers choose Basic, Standard or Premium. All three are required to publish."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {TIERS.map((tier) => {
            const unlimited = watch(`${tier}.unlimitedRevisions`);
            return (
              <fieldset key={tier} className="border border-outline p-space-md space-y-space-sm bg-surface-container-low">
                <legend className="px-2 font-label-md text-label-md uppercase font-bold text-on-surface bg-surface-container-lowest border border-outline">
                  {TIER_TITLES[tier]}
                </legend>

                <Field label="Package name" htmlFor={`${tier}-name`} required error={fieldError(`${tier}.name`)}>
                  <input id={`${tier}-name`} type="text" maxLength={60} className={inputClass(fieldError(`${tier}.name`))} {...register(`${tier}.name`)} />
                </Field>

                <Field label="Description" htmlFor={`${tier}-desc`} required error={fieldError(`${tier}.description`)}>
                  <textarea
                    id={`${tier}-desc`}
                    rows={3}
                    maxLength={300}
                    placeholder="What does this package include?"
                    className={inputClass(fieldError(`${tier}.description`))}
                    {...register(`${tier}.description`)}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-space-sm">
                  <Field label="Price (USD)" htmlFor={`${tier}-price`} required error={fieldError(`${tier}.price`)}>
                    <input
                      id={`${tier}-price`}
                      type="number"
                      min="5"
                      max="100000"
                      step="0.01"
                      inputMode="decimal"
                      className={inputClass(fieldError(`${tier}.price`))}
                      {...register(`${tier}.price`)}
                    />
                  </Field>
                  <Field label="Delivery (days)" htmlFor={`${tier}-days`} required error={fieldError(`${tier}.deliveryDays`)}>
                    <input
                      id={`${tier}-days`}
                      type="number"
                      min="1"
                      max="90"
                      step="1"
                      className={inputClass(fieldError(`${tier}.deliveryDays`))}
                      {...register(`${tier}.deliveryDays`)}
                    />
                  </Field>
                </div>

                <Field label="Revisions" htmlFor={`${tier}-rev`} error={fieldError(`${tier}.revisions`)}>
                  <input
                    id={`${tier}-rev`}
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    disabled={Boolean(unlimited)}
                    placeholder={unlimited ? "Unlimited" : "0"}
                    className={cn(inputClass(fieldError(`${tier}.revisions`)), "disabled:bg-surface-container disabled:cursor-not-allowed")}
                    {...register(`${tier}.revisions`)}
                  />
                  <label className="flex items-center gap-2 mt-1 cursor-pointer font-body-sm text-body-sm text-on-surface">
                    <input type="checkbox" className="w-4 h-4 accent-primary rounded-none" {...register(`${tier}.unlimitedRevisions`)} />
                    Unlimited revisions
                  </label>
                </Field>

                <Field
                  label="Features"
                  htmlFor={`${tier}-features`}
                  hint="One per line, up to 10. Same wording across packages lines up in the compare table."
                  error={fieldError(`${tier}.featuresText`)}
                >
                  <textarea
                    id={`${tier}-features`}
                    rows={4}
                    className={inputClass(fieldError(`${tier}.featuresText`))}
                    placeholder={"Source Figma file\nClickable prototype"}
                    {...register(`${tier}.featuresText`)}
                  />
                </Field>
              </fieldset>
            );
          })}
        </div>
      </Section>

      {/* Deliverables */}
      <Section eyebrow="05 // DELIVERABLES" title="What buyers receive" description="Optional. Up to 6 items shown on the gig page.">
        {deliverables.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-start">
            <input
              aria-label={`Deliverable ${index + 1} title`}
              maxLength={80}
              placeholder="Title (e.g. Modular component library)"
              className={cn(inputClass(false), "md:col-span-4")}
              {...register(`deliverables.${index}.title`)}
            />
            <input
              aria-label={`Deliverable ${index + 1} description`}
              maxLength={200}
              placeholder="Short description"
              className={cn(inputClass(false), "md:col-span-7")}
              {...register(`deliverables.${index}.description`)}
            />
            <button
              type="button"
              onClick={() => deliverables.remove(index)}
              aria-label={`Remove deliverable ${index + 1}`}
              className="md:col-span-1 h-11 border border-outline flex items-center justify-center hover:bg-error hover:text-on-error hover:border-error"
            >
              <Icon name="delete" className="text-body-md" />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={deliverables.fields.length >= 6}
          onClick={() => deliverables.append({ title: "", description: "" })}
          className="font-label-sm text-label-sm uppercase font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
        >
          + Add deliverable ({deliverables.fields.length}/6)
        </button>
      </Section>

      {/* FAQs */}
      <Section eyebrow="06 // FAQ" title="Frequently asked questions" description="Optional. Up to 10 questions answered on the gig page.">
        {faqs.fields.map((field, index) => (
          <div key={field.id} className="border border-outline-variant p-space-sm space-y-space-xs bg-surface-container-low">
            <div className="flex gap-space-sm">
              <input
                aria-label={`FAQ ${index + 1} question`}
                maxLength={200}
                placeholder="Question"
                className={inputClass(false)}
                {...register(`faqs.${index}.question`)}
              />
              <button
                type="button"
                onClick={() => faqs.remove(index)}
                aria-label={`Remove FAQ ${index + 1}`}
                className="w-11 h-11 border border-outline flex items-center justify-center shrink-0 hover:bg-error hover:text-on-error hover:border-error"
              >
                <Icon name="delete" className="text-body-md" />
              </button>
            </div>
            <textarea
              aria-label={`FAQ ${index + 1} answer`}
              rows={2}
              maxLength={800}
              placeholder="Answer"
              className={inputClass(false)}
              {...register(`faqs.${index}.answer`)}
            />
          </div>
        ))}
        <button
          type="button"
          disabled={faqs.fields.length >= 10}
          onClick={() => faqs.append({ question: "", answer: "" })}
          className="font-label-sm text-label-sm uppercase font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
        >
          + Add question ({faqs.fields.length}/10)
        </button>
      </Section>

      {/* Actions */}
      <div className="bg-surface-container-lowest shadow-sm p-space-md flex flex-wrap items-center justify-between gap-space-sm">
        <Link href="/dashboard/gigs" className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant hover:text-primary">
          ← Back to my gigs
        </Link>

        <div className="flex flex-wrap gap-space-sm">
          <button
            type="button"
            disabled={busy}
            onClick={save(isEdit ? "save" : "draft")}
            className="px-space-lg py-2.5 border border-on-surface text-on-surface font-label-md text-label-md uppercase font-bold hover:bg-surface-container-high disabled:opacity-60"
          >
            {saving === "save" || saving === "draft" ? "Saving..." : isEdit ? "Save changes" : "Save as draft"}
          </button>

          {status !== "published" && (
            <button
              type="button"
              disabled={busy}
              onClick={save("publish")}
              className="px-space-lg py-2.5 bg-primary text-on-primary font-label-md text-label-md uppercase font-bold hover:bg-primary-container disabled:opacity-60 shadow-[2px_2px_0px_#0b1c30]"
            >
              {saving === "publish" ? "Publishing..." : isEdit ? "Save & publish" : "Publish gig"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}