"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import { BRAND, CONTACT, EASE } from "@/lib/constants";

const CREDITS: ReadonlyArray<{ role: string; name: string }> = [
  { role: "Director", name: "[NAME]" },
  { role: "Editor", name: "[NAME]" },
  { role: "Colorist", name: "[NAME]" },
  { role: "Sound", name: "[NAME]" },
  { role: "Score", name: "[NAME]" },
];

export function Contact(): React.ReactElement {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-[color:var(--color-divider)] px-6 pt-32 pb-16 sm:px-10 sm:pt-40 sm:pb-20"
      aria-labelledby="contact-heading"
    >
      <header className="flex items-baseline justify-between">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          04 / Contact
        </span>
        <span className="text-eyebrow text-[color:var(--color-muted)] hidden sm:inline">
          End Credits
        </span>
      </header>

      <motion.h2
        id="contact-heading"
        className="font-display mt-20 text-massive"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1.1, ease: EASE.expoOut }}
      >
        Ready to tell
        <br />
        your story?
      </motion.h2>

      <motion.div
        className="mt-16 flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1, ease: EASE.expoOut, delay: 0.1 }}
      >
        <a
          href={`mailto:${CONTACT.email}`}
          className="group inline-flex items-center gap-4 border-b border-[color:var(--color-foreground)] pb-3 font-display text-3xl sm:text-4xl md:text-5xl"
          data-cursor="open"
        >
          {CONTACT.ctaLabel}
          <ArrowUpRight
            size={32}
            strokeWidth={1.25}
            className="transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
          />
        </a>

        <a
          href={`mailto:${CONTACT.email}`}
          className="text-base text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] transition-colors"
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
        <span className="uppercase tracking-[0.25em]">
          {BRAND.name} / All rights reserved
        </span>
      </footer>
    </section>
  );
}
