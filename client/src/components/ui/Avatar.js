import { cn, getInitials } from "@/lib/utils";

export default function Avatar({ user, size = "w-8 h-8", shape = "round", className }) {
  const name = user?.name ?? "";
  const radius = shape === "square" ? "rounded-none" : "rounded-full";

  if (user?.avatar?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar.url}
        alt={name}
        className={cn(size, radius, "object-cover border border-outline-variant", className)}
      />
    );
  }

  return (
    <span
      aria-label={name}
      className={cn(
        size,
        radius,
        "inline-flex items-center justify-center border border-outline-variant bg-surface-container-high text-primary font-label-sm text-label-sm",
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}