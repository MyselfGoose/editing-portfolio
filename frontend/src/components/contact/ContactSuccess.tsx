"use client";

import { useEffect, useRef } from "react";

import { CONTACT } from "@/lib/constants";

interface ContactSuccessProps {
  onReset: () => void;
}

export function ContactSuccess({
  onReset,
}: ContactSuccessProps): React.ReactElement {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="flex max-w-2xl flex-col gap-6 border border-[color:var(--color-divider)] px-6 py-8 outline-none sm:px-8 sm:py-10"
    >
      <p className="text-eyebrow text-[color:var(--color-muted)]">
        Confirmation
      </p>
      <h2 className="font-display text-headline text-balance">
        Inquiry received
      </h2>
      <p className="max-w-xl text-body-lg text-[color:var(--color-muted)]">
        Thank you — we have your note and will follow up by email. If anything
        is urgent, reach us directly.
      </p>
      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
        <a
          href={`mailto:${CONTACT.email}`}
          className="inline-flex min-h-12 w-full items-center justify-center border border-[color:var(--color-foreground)] px-6 py-3 text-eyebrow transition-colors hover:bg-[color:var(--color-foreground)] hover:text-[color:var(--color-background)] sm:w-auto"
        >
          Email us directly
        </a>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center text-eyebrow text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-foreground)]"
        >
          Send another inquiry
        </button>
      </div>
    </div>
  );
}
