"use client";

import { useCallback, useState } from "react";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { useProfile } from "./ProfileContext";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE = 4;

function CaseStudyBody({ project, onClose, onBook }) {
  const [index, setIndex] = useState(0);
  const images = project.images ?? [];
  const current = images[index];

  return (
    <div className="p-space-lg">
      <div className="flex items-center justify-between gap-space-sm border-b-2 border-on-surface pb-space-sm mb-space-md">
        <div className="min-w-0">
          <span className="font-code-sm text-code-sm text-primary block uppercase">CASE STUDY</span>
          <h2 id="case-title" className="font-headline-lg text-headline-lg font-bold text-on-surface uppercase">
            {project.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-white transition-none shrink-0"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <div className="space-y-space-md">
        {current && (
          <div>
            <div className="w-full h-64 bg-surface-container-high border border-outline overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-full h-full object-cover" src={current.url} alt={`${project.title} - image ${index + 1}`} />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-space-xs mt-space-xs">
                {images.map((image, i) => (
                  <button
                    key={image.url}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={cn("p-0.5 border", i === index ? "border-on-surface" : "border-outline-variant")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-12 object-cover" src={image.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-space-sm border border-outline p-space-sm bg-surface-container-low font-code-sm text-code-sm">
          {[
            ["CATEGORY", project.category],
            ["TIMELINE", project.duration],
            ["RESULT", project.highlightMetric],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <span className="text-on-surface-variant block uppercase text-[11px]">{label}</span>
              <span className="font-bold text-on-surface break-words">{value || "—"}</span>
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-label-md text-label-md uppercase font-bold text-on-surface mb-1">Project Summary</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">{project.description}</p>
        </div>

        {(project.deliverables ?? []).length > 0 && (
          <div>
            <h4 className="font-label-md text-label-md uppercase font-bold text-on-surface mb-1">Key Deliverables</h4>
            <div className="flex flex-wrap gap-1 font-code-sm text-[12px] text-on-surface">
              {project.deliverables.map((item) => (
                <span key={item} className="bg-surface-container-low px-1.5 py-0.5 border border-outline-variant">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-outline pt-space-sm flex flex-wrap justify-end gap-space-sm">
          {project.externalLink && (
            <a
              href={project.externalLink}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="px-space-md py-2 border border-on-surface text-on-surface font-label-sm text-label-sm uppercase hover:bg-surface-container flex items-center gap-1"
            >
              Open Live Project
              <Icon name="open_in_new" className="text-[16px]" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 border border-on-surface text-on-surface font-label-sm text-label-sm uppercase hover:bg-surface-container"
          >
            Close Viewer
          </button>
          <button
            type="button"
            onClick={onBook}
            className="px-space-md py-2 bg-primary-container text-white font-label-sm text-label-sm uppercase hover:bg-primary border border-primary-container"
          >
            Book Similar Scope
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioSection({ projects }) {
  const { requestContact } = useProfile();
  const [showAll, setShowAll] = useState(false);
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);

  const visible = showAll ? projects : projects.slice(0, INITIAL_VISIBLE);

  return (
    <section className="space-y-space-md scroll-mt-36" id="section-portfolio">
      <div className="flex items-center justify-between gap-space-sm border-b border-outline pb-space-xs">
        <div>
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">
            Featured Case Studies & Product Proofs
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Selected work and measured outcomes shared by the seller
          </p>
        </div>
        {projects.length > INITIAL_VISIBLE && (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="font-code-sm text-code-sm text-primary uppercase font-bold hover:underline flex items-center gap-1 whitespace-nowrap"
          >
            {showAll ? "Show less" : `Full archive (${projects.length})`}
            <Icon name={showAll ? "expand_less" : "arrow_forward"} className="text-[16px]" />
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="border border-outline bg-surface-container-lowest p-space-lg text-center">
          <Icon name="folder_open" className="text-[32px] text-outline mb-space-xs" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">No portfolio projects added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {visible.map((project) => (
            <div key={project._id} className="bg-surface-container-lowest border border-outline flex flex-col justify-between">
              <div className="w-full h-56 bg-surface-container-high border-b border-outline overflow-hidden relative">
                {project.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="w-full h-full object-cover" src={project.images[0].url} alt={project.title} loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <Icon name="image" className="text-[40px]" />
                  </div>
                )}
                {project.highlightMetric && (
                  <div className="absolute bottom-2 left-2 bg-on-surface text-surface px-2 py-0.5 font-code-sm text-code-sm uppercase">
                    METRIC: {project.highlightMetric}
                  </div>
                )}
              </div>

              <div className="p-space-md space-y-space-sm">
                {(project.category || project.duration) && (
                  <div className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm uppercase text-on-surface-variant">
                    {project.category && (
                      <span className="bg-surface-container px-2 py-0.5 border border-outline-variant">{project.category}</span>
                    )}
                    {project.category && project.duration && <span>//</span>}
                    {project.duration && <span>{project.duration}</span>}
                  </div>
                )}
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase">{project.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-4">{project.description}</p>

                {(project.deliverables ?? []).length > 0 && (
                  <div className="border-t border-outline-variant pt-2 space-y-1">
                    <span className="font-code-sm text-[11px] block uppercase text-on-surface-variant">Key Deliverables:</span>
                    <div className="flex flex-wrap gap-1 font-code-sm text-[12px] text-on-surface">
                      {project.deliverables.map((item) => (
                        <span key={item} className="bg-surface-container-low px-1.5 py-0.5 border border-outline-variant">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActive(project)}
                  className="w-full mt-2 bg-surface-container-lowest text-on-surface py-2 border border-on-surface font-label-sm text-label-sm uppercase hover:bg-on-surface hover:text-white transition-none flex items-center justify-center gap-1"
                >
                  View Detailed Case Study
                  <Icon name="open_in_new" className="text-[16px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(active)} onClose={close} labelledBy="case-title" className="max-w-3xl">
        {active && (
          <CaseStudyBody
            key={active._id}
            project={active}
            onClose={close}
            onBook={() => {
              const topic = active.title;
              close();
              requestContact({ topic });
            }}
          />
        )}
      </Modal>
    </section>
  );
}