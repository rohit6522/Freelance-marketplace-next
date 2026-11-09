import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
      <div>
        <div className="flex items-center gap-space-xs mb-space-xs">
          <span className="font-code-sm text-code-sm uppercase tracking-widest text-primary font-bold">{eyebrow}</span>
          <span className="w-1.5 h-1.5 bg-primary" />
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{title}</h1>
        {subtitle && <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ActionLink({ href, children }) {
  return (
    <Link
      href={href}
      className="bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-md py-2.5 hover:bg-primary-container transition-colors whitespace-nowrap text-center"
    >
      {children}
    </Link>
  );
}

export function ErrorPanel({ message, onRetry }) {
  return (
    <div role="alert" className="bg-error-container text-on-error-container p-space-md flex flex-wrap items-center justify-between gap-space-sm">
      <p className="font-body-sm text-body-sm">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-label-sm text-label-sm uppercase font-bold underline">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="bg-surface-container-lowest p-space-xl text-center shadow-sm">
      <Icon name={icon} className="text-[40px] text-outline mb-space-sm" />
      <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">{title}</h2>
      {text && <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs max-w-md mx-auto">{text}</p>}
      {action && <div className="mt-space-md">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, href, highlight = false, loading = false }) {
  const card = (
    <div
      className={cn(
        "bg-surface-container-lowest p-space-md shadow-sm relative flex flex-col justify-between h-full",
        href && "hover:shadow-md transition-shadow"
      )}
    >
      <div className="flex items-start justify-between gap-space-sm">
        <div className="min-w-0">
          <span className="font-code-sm text-code-sm text-on-surface-variant uppercase tracking-wider block">{label}</span>
          {loading ? (
            <div className="h-8 w-20 bg-surface-container animate-pulse mt-1" />
          ) : (
            <div className="font-headline-lg text-headline-lg text-on-surface mt-1 truncate">{value}</div>
          )}
        </div>
        <div
          className={cn(
            "w-8 h-8 flex items-center justify-center shrink-0",
            highlight ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
          )}
        >
          <Icon name={icon} className="text-body-md" />
        </div>
      </div>
      {hint && (
        <span
          className={cn(
            "mt-space-sm font-code-sm text-code-sm uppercase",
            highlight ? "text-primary font-bold" : "text-on-surface-variant"
          )}
        >
          {hint}
        </span>
      )}
      <div className={cn("absolute bottom-0 left-0 right-0 h-1", highlight ? "bg-primary" : "bg-outline-variant")} />
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  ) : (
    card
  );
}