import Icon from "@/components/ui/Icon";
import { fileIcon, formatBytes, formatDateTime } from "@/lib/orders";

export default function Deliverables({ order }) {
  const delivered = (order.deliveries ?? []).flatMap((d) =>
    (d.files ?? []).map((file) => ({ ...file, note: `Delivered ${formatDateTime(d.deliveredAt)}` }))
  );
  const required = (order.requirementFiles ?? []).map((file) => ({ ...file, note: "Client requirement file" }));
  const files = [...delivered, ...required];
  const notes = (order.deliveries ?? []).filter((d) => d.message);

  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">
          Deliverables &amp; Artifact Repository
        </h3>
        <span className="font-code-sm text-code-sm text-on-surface-variant">
          {files.length} {files.length === 1 ? "FILE" : "FILES"} ATTACHED
        </span>
      </div>

      {files.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-space-md">
          No files have been shared yet. Files appear here when the seller delivers work.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          {files.map((file, index) => (
            <div
              key={`${file.url}-${index}`}
              className="bg-surface-container-low p-space-sm flex flex-col justify-between hover:bg-surface-container transition-colors"
            >
              <div className="flex items-start justify-between">
                <Icon name={fileIcon(file)} className="text-primary text-headline-md" />
                {file.size ? (
                  <span className="font-code-sm text-code-sm bg-surface-container px-space-xs py-0.5 text-on-surface">
                    {formatBytes(file.size)}
                  </span>
                ) : null}
              </div>
              <div className="mt-space-md">
                <div className="font-label-md text-label-md text-on-surface truncate font-bold" title={file.name}>
                  {file.name}
                </div>
                <span className="font-code-sm text-code-sm text-on-surface-variant block">{file.note}</span>
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-space-sm pt-space-xs bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary font-label-sm text-label-sm uppercase p-space-xs text-center transition-colors block"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="border-t border-outline-variant pt-space-sm space-y-space-xs">
          <span className="font-code-sm text-code-sm uppercase text-on-surface-variant block">Delivery notes</span>
          {notes.map((d, i) => (
            <div key={i} className="bg-surface-container-low p-space-sm">
              <span className="font-code-sm text-code-sm text-on-surface-variant block">
                DELIVERY #{i + 1} / {formatDateTime(d.deliveredAt)} UTC
              </span>
              <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-line">{d.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}