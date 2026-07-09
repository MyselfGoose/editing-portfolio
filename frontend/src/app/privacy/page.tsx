import { BRAND, CONTACT } from "@/lib/constants";

const LAST_UPDATED = "2026-07-09";

export default function PrivacyPage(): React.ReactElement {
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-[var(--container-max)] flex-col gap-10 px-[var(--section-px)] py-[var(--section-py)]"
    >
      <header className="border-b border-[color:var(--color-divider)] pb-6">
        <p className="text-eyebrow text-[color:var(--color-muted)]">Privacy</p>
        <h1 className="font-display mt-6 text-headline">Privacy Policy</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-[color:var(--color-muted)]">
          This page explains what data {BRAND.name} collects through this website and how it is used.
        </p>
      </header>

      <section className="grid gap-3">
        <h2 className="font-display text-title">Analytics</h2>
        <p className="max-w-3xl text-body-lg text-[color:var(--color-muted)]">
          We use Vercel Analytics to understand page traffic and improve performance. We do not send personal contact details or custom personally identifiable events.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-display text-title">Contact Form Data</h2>
        <p className="max-w-3xl text-body-lg text-[color:var(--color-muted)]">
          When you submit the contact form, we receive the information you provide (name, email, and message) so we can respond to your inquiry.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-display text-title">Cookies</h2>
        <p className="max-w-3xl text-body-lg text-[color:var(--color-muted)]">
          The site uses essential browser storage for experience state (for example, whether the intro loader has already played). We do not use ad-tracking cookies.
        </p>
      </section>

      <section className="grid gap-3 border-t border-[color:var(--color-divider)] pt-8">
        <h2 className="font-display text-title">Contact</h2>
        <p className="max-w-3xl text-body-lg text-[color:var(--color-muted)]">
          For privacy questions, contact us at{" "}
          <a
            href={`mailto:${CONTACT.email}`}
            className="underline decoration-[color:var(--color-divider)] underline-offset-4"
          >
            {CONTACT.email}
          </a>
          .
        </p>
        <p className="font-mono text-xs text-[color:var(--color-dim)]">
          Last updated: {LAST_UPDATED}
        </p>
      </section>
    </main>
  );
}
