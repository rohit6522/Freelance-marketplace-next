"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { FormAlert } from "@/components/auth/FormParts";
import { ConfirmDialog } from "@/components/orders/OrderDialogs";
import ImageUploader from "./ImageUploader";
import { Field, inputClass } from "./FormKit";
import { EmptyState, ErrorPanel, PageHeader } from "./DashboardParts";
import { useApiData } from "@/hooks/useApiData";
import * as portfolioService from "@/services/portfolioService";
import * as uploadService from "@/services/uploadService";
import { applyApiErrors } from "@/lib/forms";

const MAX_PROJECTS = 20;
const LINK_PATTERN = /^https?:\/\/\S+$/;

function ProjectForm({ project, onSaved, onClose }) {
  const [images, setImages] = useState((project?.images ?? []).map((i) => ({ url: i.url, publicId: i.publicId })));
  const [removed, setRemoved] = useState([]);
  const [formErrors, setFormErrors] = useState([]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      category: project?.category ?? "",
      highlightMetric: project?.highlightMetric ?? "",
      duration: project?.duration ?? "",
      externalLink: project?.externalLink ?? "",
      deliverablesText: (project?.deliverables ?? []).join("\n"),
    },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setFormErrors([]);

    const deliverables = values.deliverablesText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (deliverables.length > 8 || deliverables.some((d) => d.length > 60)) {
      setError("deliverablesText", { type: "manual", message: "Up to 8 deliverables, 60 characters each" });
      return;
    }

    const body = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
      highlightMetric: values.highlightMetric.trim(),
      duration: values.duration.trim(),
      externalLink: values.externalLink.trim(),
      deliverables,
      images: images.map(({ url, publicId }) => (publicId ? { url, publicId } : { url })),
    };

    try {
      if (project) await portfolioService.update(project._id, body);
      else await portfolioService.create(body);
      removed.forEach((image) => uploadService.deleteUpload(image.publicId).catch(() => {}));
      toast.success(project ? "Project updated" : "Project added");
      onSaved();
    } catch (err) {
      setFormErrors(
        applyApiErrors(err, setError, { title: "title", description: "description", externalLink: "externalLink" })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-space-lg space-y-space-md">
      <div className="flex items-center justify-between border-b-2 border-on-surface pb-space-sm">
        <h3 id="project-title" className="font-headline-md text-headline-md font-bold text-on-surface uppercase">
          {project ? "Edit project" : "Add project"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-white"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>

      <Field label="Project title" htmlFor="p-title" required error={errors.title?.message}>
        <input
          id="p-title"
          maxLength={120}
          className={inputClass(errors.title)}
          {...register("title", {
            required: "Title is required",
            validate: (v) => v.trim().length >= 3 || "Title must be at least 3 characters",
          })}
        />
      </Field>

      <Field label="Summary" htmlFor="p-desc" required error={errors.description?.message}>
        <textarea
          id="p-desc"
          rows={4}
          maxLength={1000}
          className={inputClass(errors.description)}
          {...register("description", {
            required: "Summary is required",
            validate: (v) => v.trim().length >= 10 || "Summary must be at least 10 characters",
          })}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
        <Field label="Category" htmlFor="p-cat">
          <input id="p-cat" maxLength={60} placeholder="Fintech Infra" className={inputClass(false)} {...register("category")} />
        </Field>
        <Field label="Result / metric" htmlFor="p-metric">
          <input id="p-metric" maxLength={80} placeholder="+62% onboarding" className={inputClass(false)} {...register("highlightMetric")} />
        </Field>
        <Field label="Timeline" htmlFor="p-duration">
          <input id="p-duration" maxLength={40} placeholder="14 weeks sprint" className={inputClass(false)} {...register("duration")} />
        </Field>
      </div>

      <Field label="Live link" htmlFor="p-link" hint="Optional, must start with http:// or https://" error={errors.externalLink?.message}>
        <input
          id="p-link"
          type="url"
          placeholder="https://example.com/case-study"
          className={inputClass(errors.externalLink)}
          {...register("externalLink", { validate: (v) => !v.trim() || LINK_PATTERN.test(v.trim()) || "Enter a valid http(s) link" })}
        />
      </Field>

      <Field label="Key deliverables" htmlFor="p-deliv" hint="One per line, up to 8" error={errors.deliverablesText?.message}>
        <textarea id="p-deliv" rows={3} className={inputClass(errors.deliverablesText)} {...register("deliverablesText")} />
      </Field>

      <div>
        <span className="block font-label-md text-label-md text-on-surface mb-1">Images</span>
        <ImageUploader value={images} onChange={setImages} max={6} onRemoveSaved={(image) => setRemoved((r) => [...r, image])} />
      </div>

      {formErrors.length > 0 && (
        <FormAlert variant="error">
          {formErrors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </FormAlert>
      )}

      <div className="flex justify-end gap-space-sm">
        <button type="button" onClick={onClose} className="px-space-md py-2 border border-outline uppercase font-label-sm text-label-sm hover:bg-surface-container">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-space-lg py-2 bg-primary text-on-primary uppercase font-label-sm text-label-sm font-bold hover:bg-primary-container disabled:opacity-75"
        >
          {isSubmitting ? "Saving..." : "Save project"}
        </button>
      </div>
    </form>
  );
}

export default function PortfolioManager() {
  const fetcher = useCallback(() => portfolioService.mine(), []);
  const { data, error, loading, reload } = useApiData(fetcher);
  const [editing, setEditing] = useState(null); // null | "new" | project
  const [toDelete, setToDelete] = useState(null);
  const closeDialog = useCallback(() => setEditing(null), []);

  const projects = data?.projects ?? [];

  return (
    <>
      <PageHeader
        eyebrow="DASHBOARD // FREELANCER"
        title="Portfolio"
        subtitle="Case studies shown on your public profile. Add results and images that prove your work."
        action={
          <button
            type="button"
            disabled={projects.length >= MAX_PROJECTS}
            onClick={() => setEditing("new")}
            className="bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-md py-2.5 hover:bg-primary-container transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            + Add project ({projects.length}/{MAX_PROJECTS})
          </button>
        }
      />

      {error && <ErrorPanel message={error} onRetry={reload} />}

      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {[0, 1].map((i) => (
            <div key={i} className="h-72 bg-surface-container-lowest animate-pulse" />
          ))}
        </div>
      )}

      {data && projects.length === 0 && (
        <EmptyState icon="folder_open" title="No projects yet" text="Add your first case study to build trust with buyers." />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {projects.map((project) => (
          <article key={project._id} className="bg-surface-container-lowest shadow-sm flex flex-col">
            <div className="h-44 bg-surface-container-high overflow-hidden relative">
              {project.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="w-full h-full object-cover" src={project.images[0].url} alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-outline">
                  <Icon name="image" className="text-[36px]" />
                </div>
              )}
              {project.highlightMetric && (
                <span className="absolute bottom-2 left-2 bg-on-surface text-surface px-2 py-0.5 font-code-sm text-code-sm uppercase">
                  {project.highlightMetric}
                </span>
              )}
            </div>
            <div className="p-space-md flex-1 flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-center gap-space-xs font-code-sm text-code-sm text-on-surface-variant uppercase">
                {project.category && <span className="bg-surface-container px-2 py-0.5 border border-outline-variant">{project.category}</span>}
                {project.duration && <span>{project.duration}</span>}
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{project.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">{project.description}</p>
              <div className="flex gap-space-xs mt-auto pt-space-sm">
                <button
                  type="button"
                  onClick={() => setEditing(project)}
                  className="px-space-sm py-1.5 border border-outline font-label-sm text-label-sm uppercase font-bold flex items-center gap-1 hover:bg-surface-container"
                >
                  <Icon name="edit" className="text-body-sm" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(project)}
                  className="px-space-sm py-1.5 border border-outline font-label-sm text-label-sm uppercase font-bold flex items-center gap-1 hover:bg-error hover:text-on-error hover:border-error"
                >
                  <Icon name="delete" className="text-body-sm" />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal open={editing !== null} onClose={closeDialog} labelledBy="project-title" className="max-w-2xl">
        {editing !== null && (
          <ProjectForm
            key={editing === "new" ? "new" : editing._id}
            project={editing === "new" ? null : editing}
            onClose={closeDialog}
            onSaved={() => {
              closeDialog();
              reload();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete this project?"
        description={`"${toDelete?.title ?? ""}" will be removed from your public profile.`}
        confirmLabel="Delete project"
        danger
        onConfirm={async () => {
          const doomed = toDelete;
          await portfolioService.remove(doomed._id);
          (doomed.images ?? []).forEach((image) => image.publicId && uploadService.deleteUpload(image.publicId).catch(() => {}));
          toast.success("Project deleted");
          setToDelete(null);
          reload();
        }}
      />
    </>
  );
}