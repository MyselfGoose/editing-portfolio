"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({
  reset,
}: ErrorPageProps): React.ReactElement {
  return (
    <main
      id="main"
      className="flex min-h-[100svh] flex-col items-center justify-center px-[var(--section-px)] py-24 text-center"
    >
      <p className="text-eyebrow text-[color:var(--color-muted)]">Error</p>
      <h1 className="font-display mt-8 text-headline max-w-2xl text-balance">
        Something interrupted the playback.
      </h1>
      <p className="mt-6 max-w-md text-body-lg text-[color:var(--color-muted)]">
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="text-eyebrow mt-12 border border-[color:var(--color-divider)] px-6 py-3 transition-colors hover:border-[color:var(--color-foreground)]"
      >
        Try again
      </button>
    </main>
  );
}
