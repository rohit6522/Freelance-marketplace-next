import Link from "next/link";
import Logo from "./Logo";

export default function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
      <div className="h-16 max-w-7xl mx-auto px-margin-sm lg:px-margin flex items-center justify-between gap-space-md">
        <Logo />
        <Link
          href="/gigs"
          className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant hover:text-primary transition-colors"
        >
          Back to Marketplace
        </Link>
      </div>
    </header>
  );
}