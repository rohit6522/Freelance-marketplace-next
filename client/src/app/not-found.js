import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-margin-sm">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant p-space-xl text-center">
        <p className="font-code-sm text-code-sm text-primary uppercase tracking-widest mb-space-sm">Error 404</p>
        <h1 className="font-headline-md text-headline-md text-on-surface uppercase mb-space-sm">Page not found</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/gigs"
          className="inline-block bg-primary text-on-primary font-label-sm text-label-sm uppercase px-space-lg py-space-sm hover:bg-primary-container hover:text-on-primary-container transition-colors"
        >
          Back to marketplace
        </Link>
      </div>
    </main>
  );
}