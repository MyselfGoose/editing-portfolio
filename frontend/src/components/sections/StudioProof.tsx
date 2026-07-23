"use client";

import { motion } from "motion/react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import {
  getPublishableTestimonials,
  type Testimonial,
} from "@/data/testimonials";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import { EASE } from "@/lib/constants";
import { getAllFilms, getFilmYearRange } from "@/lib/projects";

const STUDIO_NOTES = [
  "Picture lock before polish — pacing first, then grade.",
  "Remote finish for couples and filmmakers who already have the footage.",
  "Wedding and celebration films cut for the room they will play in.",
] as const;

function TestimonialList({
  entries,
}: {
  entries: ReadonlyArray<Testimonial>;
}): React.ReactElement | null {
  if (entries.length === 0) return null;

  return (
    <ul className="mt-12 grid grid-cols-1 gap-10 border-t border-[color:var(--color-divider)] pt-10 md:grid-cols-3 md:gap-8">
      {entries.slice(0, 3).map((entry) => (
        <li key={`${entry.attribution}-${entry.quote.slice(0, 24)}`}>
          <blockquote className="flex flex-col gap-4">
            <p className="text-body-lg text-[color:var(--color-muted)]">
              “{entry.quote}”
            </p>
            <footer className="font-mono text-xs text-[color:var(--color-dim)]">
              {entry.attribution}
              {entry.role ? ` · ${entry.role}` : null}
            </footer>
          </blockquote>
        </li>
      ))}
    </ul>
  );
}

export function StudioProof(): React.ReactElement {
  const revealMotion = useRevealMotion();
  const films = getAllFilms();
  const { earliest, latest } = getFilmYearRange();
  const yearLabel =
    earliest === latest ? String(latest) : `${earliest}–${latest}`;
  const factLine = `${films.length} films · ${yearLabel} · California`;
  const quotes = getPublishableTestimonials();

  return (
    <Section id="proof" labelledBy="proof-heading" borderTop>
      <Container>
        <motion.div
          className="flex flex-col gap-6 py-4 sm:py-6"
          variants={revealMotion.variants}
          initial={revealMotion.initial}
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: EASE.expoOut }}
        >
          <p className="text-eyebrow text-[color:var(--color-muted)]">
            Selected work
          </p>
          <h2
            id="proof-heading"
            className="font-display text-headline max-w-3xl text-balance"
          >
            {factLine}
          </h2>
          <ul className="mt-4 flex max-w-3xl flex-col gap-4 text-body-lg text-[color:var(--color-muted)]">
            {STUDIO_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <TestimonialList entries={quotes} />
        </motion.div>
      </Container>
    </Section>
  );
}
