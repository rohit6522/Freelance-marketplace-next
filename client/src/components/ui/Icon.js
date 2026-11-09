import { cn } from "@/lib/utils";

export default function Icon({ name, filled = false, className, ...props }) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      {...props}
    >
      {name}
    </span>
  );
}