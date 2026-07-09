"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import { ContactForm } from "@/components/contact/ContactForm";
import { useCursor } from "@/components/experience/CursorContext";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CREDITS } from "@/data/credits";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import { BRAND, CONTACT, EASE, SOCIAL } from "@/lib/constants";

const SOCIAL_ENTRIES = (
  Object.entries(SOCIAL) as Array<[keyof typeof SOCIAL, string | undefined]>
).filter((entry): entry is [keyof typeof SOCIAL, string] => Boolean(entry[1]));

export function Contact(): React.ReactElement {
  const revealMotion = useRevealMotion();
  const { setState, reset } = useCursor();

  return (
    <Section id="contact" labelledBy="contact-heading" borderTop padding="contact">
      <Container>
        <SectionHeader label="05 / Contact" aside="End Credits" />

        <motion.h2
          id="contact-heading"
          className="font-display mt-12 text-massive max-w-4xl text-balance sm:mt-20"
          variants={revealMotion.variants}
          initial={revealMotion.initial}
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, ease: EASE.expoOut }}
        >
          Ready to tell your story?
        </motion.h2>

        <motion.div
          className="mt-16 flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
          variants={revealMotion.variants}
          initial={revealMotion.initial}
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease: EASE.expoOut, delay: 0.1 }}
        >
          <div className="group flex max-w-full flex-wrap items-center gap-3 border-b border-[color:var(--color-foreground)] pb-3 font-display text-cta sm:gap-4">
            <span className="text-balance">{CONTACT.ctaLabel}</span>
            <ArrowUpRight
              size={32}
              strokeWidth={1.25}
              className="shrink-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
            />
          </div>

          <a
            href={`mailto:${CONTACT.email}`}
            className="text-body-lg text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-foreground)]"
            onMouseEnter={() => setState({ kind: "open" })}
            onMouseLeave={reset}
            onFocus={() => setState({ kind: "open" })}
            onBlur={reset}
            data-cursor="open"
          >
            {CONTACT.email}
          </a>
        </motion.div>
        <ContactForm />

        {SOCIAL_ENTRIES.length > 0 ? (
          <motion.ul
            className="mt-10 flex flex-wrap gap-6 font-mono text-xs text-[color:var(--color-muted)]"
            variants={revealMotion.variants}
            initial={revealMotion.initial}
            whileInView="visible"
            viewport={{ once: true, margin: "-15% 0px" }}
          >
            {SOCIAL_ENTRIES.map(([network, url]) => (
              <li key={network}>
                <a
                  href={url}
                  className="text-eyebrow transition-colors hover:text-[color:var(--color-foreground)]"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Goose Productions on ${network}`}
                >
                  {network === "instagram" ? BRAND.handle : network}
                </a>
              </li>
            ))}
          </motion.ul>
        ) : null}

        <div className="mt-32 border-t border-[color:var(--color-divider)] pt-10">
          <p className="text-eyebrow text-[color:var(--color-muted)]">
            Credits
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-4 font-mono text-xs sm:grid-cols-2 md:grid-cols-3">
            {CREDITS.map((credit) => (
              <li
                key={credit.role}
                className="flex justify-between gap-6 border-t border-[color:var(--color-divider)] pt-3"
              >
                <span className="text-[color:var(--color-dim)] uppercase tracking-[0.2em]">
                  {credit.role}
                </span>
                <span className="text-[color:var(--color-foreground)]">
                  {credit.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-[color:var(--color-divider)] pt-8 font-mono text-xs text-[color:var(--color-muted)] sm:flex-row sm:items-center">
          <span>&copy; {new Date().getFullYear()} {BRAND.name}</span>
          <div className="flex max-w-full flex-wrap items-center gap-3">
            <span className="text-balance uppercase tracking-[0.25em]">
              {BRAND.name} / All rights reserved
            </span>
            <span aria-hidden="true">/</span>
            <a
              href="/privacy"
              className="text-eyebrow transition-colors hover:text-[color:var(--color-foreground)]"
            >
              Privacy
            </a>
          </div>
        </footer>
      </Container>
    </Section>
  );
}
