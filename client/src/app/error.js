"use client";

export default function GlobalError({ error, reset }) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-margin-sm">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant p-space-xl text-center">
        <p className="font-code-sm text-code-sm text-error uppercase tracking-widest mb-space-sm">Something went wrong</p>
        <h1 className="font-headline-md text-headline-md text-on-surface uppercase mb-space-sm">Unexpected error</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
          {error?.message || "Please try again. If the problem continues, contact support."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="bg-primary text-on-primary font-label-sm text-label-sm uppercase px-space-lg py-space-sm hover:bg-primary-container hover:text-on-primary-container transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}