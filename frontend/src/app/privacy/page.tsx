import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BRAND, CONTACT } from "@/lib/constants";

const LAST_UPDATED = "2026-07-09";

const SECTIONS = [
  {
    id: "analytics",
    title: "Analytics",
    body: "We use Vercel Analytics to understand page traffic and improve performance. We do not send personal contact details or custom personally identifiable events.",
  },
  {
    id: "contact-form",
    title: "Contact form data",
    body: "When you submit the contact form, we receive the information you provide (name, email, and message) so we can respond to your inquiry.",
  },
  {
    id: "cookies",
    title: "Cookies",
    body: "The site uses essential browser storage for experience state (for example, whether the intro loader has already played). We do not use ad-tracking cookies.",
  },
] as const;

export default function PrivacyPage(): React.ReactElement {
  return (
    <PageShell>
      <div className="flex flex-col gap-10 pb-[clamp(3rem,8vw,5rem)] md:gap-12 lg:gap-14">
        <header className="border-b border-[color:var(--color-divider)] pb-8 md:pb-10">
          <p className="text-eyebrow text-[color:var(--color-muted)]">Privacy</p>
          <h1 className="font-display mt-4 max-w-3xl text-balance text-headline sm:mt-6">
            Privacy policy
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-[color:var(--color-muted)] sm:mt-6">
            This page explains what data {BRAND.name} collects through this
            website and how it is used.
          </p>
        </header>

        <div className="flex flex-col gap-10 md:gap-12">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="max-w-3xl"
            >
              <h2
                id={`${section.id}-heading`}
                className="font-display text-title text-balance"
              >
                {section.title}
              </h2>
              <p className="mt-3 text-body-lg text-[color:var(--color-muted)] sm:mt-4">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <section
          aria-labelledby="privacy-contact-heading"
          className="max-w-3xl border-t border-[color:var(--color-divider)] pt-8 md:pt-10"
        >
          <h2 id="privacy-contact-heading" className="font-display text-title">
            Contact
          </h2>
          <p className="mt-3 text-body-lg text-[color:var(--color-muted)] sm:mt-4">
            For privacy questions, contact us at{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex min-h-11 items-center break-all text-[color:var(--color-foreground)] underline decoration-[color:var(--color-divider)] underline-offset-4 transition-colors hover:decoration-[color:var(--color-foreground)]"
            >
              {CONTACT.email}
            </a>
            .
          </p>
          <p className="mt-4 font-mono text-xs text-[color:var(--color-dim)]">
            Last updated: {LAST_UPDATED}
          </p>
        </section>

        <div className="border-t border-[color:var(--color-divider)] pt-8 md:pt-10">
          <SiteFooter />
          <p className="mt-6">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center font-mono text-xs text-[color:var(--color-dim)] underline decoration-[color:var(--color-divider)] underline-offset-4 transition-colors hover:text-[color:var(--color-muted)]"
            >
              Back to contact
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
