"use client";

import { motion } from "motion/react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import { EASE } from "@/lib/constants";
import { formatIndex } from "@/lib/utils";

interface Offering {
  index: number;
  title: string;
  copy: string;
}

const OFFERINGS: ReadonlyArray<Offering> = [
  {
    index: 1,
    title: "Wedding Film Edit.",
    copy: "Full post on your wedding day footage — selects through picture lock — paced for emotion and the room it will play in.",
  },
  {
    index: 2,
    title: "Celebration Films.",
    copy: "Birthdays, quinces, and milestone films finished with the same editorial standard as the wedding work.",
  },
  {
    index: 3,
    title: "Color Grade.",
    copy: "Look development and finishing grade so skin, light, and mood hold across every deliverable.",
  },
  {
    index: 4,
    title: "Delivery & Revisions.",
    copy: "Platform-ready masters plus a focused revision pass until the cut feels right to share.",
  },
];

export function Services(): React.ReactElement {
  const revealMotion = useRevealMotion();

  return (
    <Section id="services" labelledBy="services-heading" borderTop>
      <Container>
        <SectionHeader label="04 / Services" aside="What we finish" />

        <h2
          id="services-heading"
          className="font-display mt-10 text-headline max-w-3xl sm:mt-12"
        >
          Editorial finish for weddings and celebrations.
        </h2>

        <ol className="mt-16 divide-y divide-[color:var(--color-divider)]">
          {OFFERINGS.map((offering) => (
            <motion.li
              key={offering.index}
              className="grid grid-cols-1 gap-4 py-12 sm:gap-6 sm:py-16 md:grid-cols-12 md:gap-10"
              variants={revealMotion.variants}
              initial={revealMotion.initial}
              whileInView="visible"
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1, ease: EASE.expoOut }}
            >
              <div className="flex flex-col gap-2 md:col-span-2 md:gap-4">
                <span className="font-mono text-xs text-[color:var(--color-dim)]">
                  {formatIndex(offering.index)}
                </span>
                <span className="text-eyebrow text-[color:var(--color-muted)]">
                  Offering {formatIndex(offering.index)}
                </span>
              </div>
              <div className="md:col-span-5">
                <h3 className="font-display text-chapter">{offering.title}</h3>
              </div>
              <div className="md:col-span-5 md:pt-4">
                <p className="max-w-md text-body-lg text-[color:var(--color-muted)]">
                  {offering.copy}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
