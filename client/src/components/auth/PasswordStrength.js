import { getPasswordStrength } from "@/lib/password";
import { cn } from "@/lib/utils";

export function StrengthLabel({ value }) {
  const { level, label } = getPasswordStrength(value);
  const color = level === 0 ? "text-on-surface-variant" : level === 1 ? "text-error" : "text-primary";

  return (
    <span className={cn("font-code-sm text-code-sm font-bold uppercase", color)}>Strength: {label}</span>
  );
}

// Solid 3-segment meter (design jaisa, koi gradient nahi)
export function StrengthMeter({ value }) {
  const { level } = getPasswordStrength(value);
  const fill = level === 1 ? "bg-error" : level === 2 ? "bg-primary-container" : "bg-primary";
  const segment = (n) => (level >= n ? fill : "bg-outline-variant");

  return (
    <div aria-hidden="true">
      <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full bg-surface-container">
        <div className={cn("h-full transition-none", segment(1))} />
        <div className={cn("h-full transition-none", segment(2))} />
        <div className={cn("h-full transition-none", segment(3))} />
      </div>
      <div className="flex justify-between text-[11px] font-code-sm uppercase tracking-wide text-on-surface-variant mt-1.5">
        <span>Fair (8+ chars)</span>
        <span className="text-center">Strong (mixed chars)</span>
        <span className="text-right">Enterprise Grade (symbols)</span>
      </div>
    </div>
  );
}