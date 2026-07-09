import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <main
      id="main"
      className="flex min-h-[100svh] flex-col items-center justify-center px-[var(--section-px)] py-24 text-center"
    >
      <p className="text-eyebrow text-[color:var(--color-muted)]">404 / Not Found</p>
      <h1 className="font-display mt-8 text-headline max-w-2xl text-balance">
        This frame was left on the cutting room floor.
      </h1>
      <p className="mt-6 max-w-md text-body-lg text-[color:var(--color-muted)]">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/"
          className="text-eyebrow border border-[color:var(--color-divider)] px-6 py-3 transition-colors hover:border-[color:var(--color-foreground)]"
        >
          Return home
        </Link>
        <Link
          href="/#hero"
          className="text-eyebrow text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-foreground)]"
        >
          Back to hero
        </Link>
      </div>
    </main>
  );
}
