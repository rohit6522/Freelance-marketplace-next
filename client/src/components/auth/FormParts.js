import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 flex items-center gap-1 font-body-sm text-body-sm text-error">
      <Icon name="error" filled className="text-sm" />
      <span>{message}</span>
    </p>
  );
}

const ALERT_VARIANTS = {
  loading: { box: "bg-surface-container border-outline-variant", icon: "sync", iconClass: "text-primary animate-spin", text: "text-on-surface font-medium" },
  success: { box: "bg-surface-container border-outline-variant", icon: "check_circle", iconClass: "text-primary", text: "text-primary font-semibold" },
  error: { box: "bg-error-container border-error", icon: "error", iconClass: "text-error", text: "text-on-error-container font-medium" },
  info: { box: "bg-surface-container-low border-outline-variant", icon: "info", iconClass: "text-primary", text: "text-on-surface" },
};

export function FormAlert({ variant = "info", className, children }) {
  const v = ALERT_VARIANTS[variant];
  return (
    <div role={variant === "error" ? "alert" : "status"} className={cn("p-space-sm border", v.box, className)}>
      <div className="flex items-start gap-2">
        <Icon name={v.icon} className={cn("text-lg", v.iconClass)} />
        <div className={cn("font-body-sm text-body-sm", v.text)}>{children}</div>
      </div>
    </div>
  );
}

// Design ka flat square checkbox. Input sr-only hai, box checked state dikhata hai.
export function SquareCheckbox({ id, registration, checked, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-space-sm cursor-pointer select-none">
        <input
          id={id}
          type="checkbox"
          className="sr-only peer"
          aria-invalid={error ? "true" : undefined}
          {...registration}
        />
        <span
          className={cn(
            "w-4 h-4 mt-0.5 border flex items-center justify-center flex-shrink-0 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
            error ? "border-error" : "border-on-surface",
            checked ? "bg-primary" : "bg-surface-container-lowest"
          )}
        >
          <Icon name="check" className={cn("text-xs text-on-primary", !checked && "hidden")} />
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">{children}</span>
      </label>
      <FieldError message={error} />
    </div>
  );
}