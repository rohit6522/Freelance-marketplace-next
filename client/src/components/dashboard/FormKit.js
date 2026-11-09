import { FieldError } from "@/components/auth/FormParts";
import { cn } from "@/lib/utils";

export const inputClass = (hasError) =>
  cn(
    "w-full px-space-md py-2.5 bg-surface-container-lowest border text-on-surface font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none",
    hasError ? "border-error" : "border-outline"
  );

export function Section({ eyebrow, title, description, children }) {
  return (
    <section className="bg-surface-container-lowest shadow-sm">
      <div className="p-space-md border-b border-outline-variant">
        {eyebrow && <span className="font-code-sm text-code-sm text-primary uppercase font-bold block">{eyebrow}</span>}
        <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">{title}</h2>
        {description && <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{description}</p>}
      </div>
      <div className="p-space-md space-y-space-md">{children}</div>
    </section>
  );
}

export function Field({ label, htmlFor, required, hint, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block font-label-md text-label-md text-on-surface mb-1">
        {label}
        {required && <span className="text-primary font-bold"> *</span>}
      </label>
      {children}
      {hint && <p className="font-code-sm text-code-sm text-on-surface-variant mt-1">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}