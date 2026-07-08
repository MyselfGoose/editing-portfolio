"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useCursor } from "@/components/experience/CursorContext";
import { BRAND, CONTACT, EASE } from "@/lib/constants";
import { sectionReveal } from "@/lib/motion-presets";

const CREDITS: ReadonlyArray<{ role: string; name: string }> = [
  { role: "Director", name: "[NAME]" },
  { role: "Editor", name: "[NAME]" },
  { role: "Colorist", name: "[NAME]" },
  { role: "Sound", name: "[NAME]" },
  { role: "Score", name: "[NAME]" },
];

export function Contact(): React.ReactElement {
  const { tier } = useBreakpoint();
  const reveal = sectionReveal(tier);
  const { setState, reset } = useCursor();

  return (
    <Section id="contact" labelledBy="contact-heading" borderTop padding="contact">
      <Container>
        <SectionHeader label="04 / Contact" aside="End Credits" />

        <motion.h2
          id="contact-heading"
          className="font-display mt-12 text-massive max-w-4xl text-balance sm:mt-20"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, ease: EASE.expoOut }}
        >
          Ready to tell your story?
        </motion.h2>

        <motion.div
          className="mt-16 flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease: EASE.expoOut, delay: 0.1 }}
        >
          <a
            href={`mailto:${CONTACT.email}`}
            className="group flex max-w-full flex-wrap items-center gap-3 border-b border-[color:var(--color-foreground)] pb-3 font-display text-cta sm:gap-4"
            onMouseEnter={() => setState({ kind: "open" })}
            onMouseLeave={reset}
            onFocus={() => setState({ kind: "open" })}
            onBlur={reset}
            data-cursor="open"
          >
            <span className="text-balance">{CONTACT.ctaLabel}</span>
            <ArrowUpRight
              size={32}
              strokeWidth={1.25}
              className="shrink-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
            />
          </a>

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
          <span className="max-w-full text-balance uppercase tracking-[0.25em]">
            {BRAND.name} / All rights reserved
          </span>
        </footer>
      </Container>
    </Section>
  );
}
