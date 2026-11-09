import Icon from "@/components/ui/Icon";

export default function PageSpinner({ label = "Loading..." }) {
  return (
    <div role="status" className="min-h-[50vh] flex flex-col items-center justify-center gap-space-sm text-on-surface-variant">
      <Icon name="sync" className="text-primary text-[28px] animate-spin" />
      <span className="font-code-sm text-code-sm uppercase tracking-wider">{label}</span>
    </div>
  );
}