"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

import { ContactForm } from "@/components/contact/ContactForm";
import { useCursor } from "@/components/experience/CursorContext";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import { BRAND, CONTACT, EASE, SOCIAL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SOCIAL_ENTRIES = (
  Object.entries(SOCIAL) as Array<[keyof typeof SOCIAL, string | undefined]>
).filter((entry): entry is [keyof typeof SOCIAL, string] => Boolean(entry[1]));

export function ContactPageContent(): React.ReactElement {
  const revealMotion = useRevealMotion();
  const { setState, reset } = useCursor();

  return (
    <div className="flex flex-col gap-12 pb-[clamp(3rem,8vw,5rem)] md:gap-16 lg:gap-20">
      <header className="border-b border-[color:var(--color-divider)] pb-8 md:pb-10">
        <p className="text-eyebrow text-[color:var(--color-muted)]">Contact</p>

        <motion.h1
          className="font-display mt-4 max-w-4xl text-balance text-headline sm:mt-6 lg:mt-8 lg:text-massive"
          variants={revealMotion.variants}
          initial={revealMotion.initial}
          animate="visible"
          transition={{ duration: 1.1, ease: EASE.expoOut }}
        >
          Ready to begin your wedding film?
        </motion.h1>

        <motion.p
          className="mt-4 max-w-2xl text-body-lg text-[color:var(--color-muted)] sm:mt-6"
          variants={revealMotion.variants}
          initial={revealMotion.initial}
          animate="visible"
          transition={{ duration: 0.9, ease: EASE.expoOut, delay: 0.05 }}
        >
          Share a few details about the day, the footage, and your timeline.
          Prefer email? Reach out directly anytime.
        </motion.p>
      </header>

      <motion.div
        className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10"
        variants={revealMotion.variants}
        initial={revealMotion.initial}
        animate="visible"
        transition={{ duration: 1, ease: EASE.expoOut, delay: 0.1 }}
      >
        <div className="flex flex-col gap-3">
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            Project inquiry
          </span>
          <p
            className={cn(
              "font-display text-balance text-title sm:text-cta",
              "max-w-xl leading-tight",
            )}
          >
            {CONTACT.ctaLabel}
          </p>
        </div>

        <a
          href={`mailto:${CONTACT.email}`}
          className={cn(
            "inline-flex min-h-12 w-full max-w-full items-center justify-between gap-3",
            "border border-[color:var(--color-divider)] px-4 py-3",
            "text-body-lg text-[color:var(--color-foreground)] transition-colors",
            "hover:border-[color:var(--color-foreground)]",
            "sm:w-auto sm:min-w-[18rem] sm:justify-start",
          )}
          onMouseEnter={() => setState({ kind: "open" })}
          onMouseLeave={reset}
          onFocus={() => setState({ kind: "open" })}
          onBlur={reset}
          data-cursor="open"
        >
          <span className="truncate">{CONTACT.email}</span>
          <ArrowUpRight
            size={22}
            strokeWidth={1.25}
            className="shrink-0"
            aria-hidden="true"
          />
        </a>
      </motion.div>

      <ContactForm />

      {SOCIAL_ENTRIES.length > 0 ? (
        <motion.section
          aria-label="Social links"
          className="border-t border-[color:var(--color-divider)] pt-8"
          variants={revealMotion.variants}
          initial={revealMotion.initial}
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <p className="text-eyebrow text-[color:var(--color-muted)]">Follow</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {SOCIAL_ENTRIES.map(([network, url]) => (
              <li key={network}>
                <a
                  href={url}
                  className="inline-flex min-h-11 items-center text-eyebrow transition-colors hover:text-[color:var(--color-foreground)]"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Goose Productions on ${network}`}
                >
                  {network === "instagram" ? BRAND.handle : network}
                </a>
              </li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      <div className="border-t border-[color:var(--color-divider)] pt-8 md:pt-10">
        <SiteFooter />
      </div>
    </div>
  );
}
