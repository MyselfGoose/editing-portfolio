"use client";

import { motion } from "motion/react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import { EASE } from "@/lib/constants";
import { formatIndex } from "@/lib/utils";

interface Chapter {
  index: number;
  title: string;
  copy: string;
}

const CHAPTERS: ReadonlyArray<Chapter> = [
  {
    index: 1,
    title: "Pre-production.",
    copy: "You tell us what the video needs to achieve. We review the brief, the footage and the deadline so everyone is on the same page before editing starts.",
  },
  {
    index: 2,
    title: "Editing.",
    copy: "We pull the strongest moments from the footage and build the first cut. Pacing and structure come first so the story reads clearly.",
  },
  {
    index: 3,
    title: "Color.",
    copy: "When the edit is locked we work on the grade. Contrast, temperature and mood are adjusted until the footage looks the way it should on every screen.",
  },
  {
    index: 4,
    title: "Delivery.",
    copy: "We export the final file for every platform you need. Web, social, presentations or archive. Everything is checked before it is sent to you.",
  },
  {
    index: 5,
    title: "Refinement.",
    copy: "Your notes go back into the timeline. We revise until the edit feels right and you are happy to share it.",
  },
];

export function Services(): React.ReactElement {
  const revealMotion = useRevealMotion();

  return (
    <Section id="services" labelledBy="services-heading" borderTop>
      <Container>
        <SectionHeader label="04 / Process" aside="How we work" />

        <h2
          id="services-heading"
          className="font-display mt-10 text-headline max-w-3xl sm:mt-12"
        >
          Our Process
        </h2>

        <ol className="mt-16 divide-y divide-[color:var(--color-divider)]">
          {CHAPTERS.map((chapter) => (
            <motion.li
              key={chapter.index}
              className="grid grid-cols-1 gap-4 py-12 sm:gap-6 sm:py-16 md:grid-cols-12 md:gap-10"
              variants={revealMotion.variants}
              initial={revealMotion.initial}
              whileInView="visible"
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1, ease: EASE.expoOut }}
            >
              <div className="flex flex-col gap-2 md:col-span-2 md:gap-4">
                <span className="font-mono text-xs text-[color:var(--color-dim)]">
                  {formatIndex(chapter.index)}
                </span>
                <span className="text-eyebrow text-[color:var(--color-muted)]">
                  Chapter {formatIndex(chapter.index)}
                </span>
              </div>
              <div className="md:col-span-5">
                <h3 className="font-display text-chapter">{chapter.title}</h3>
              </div>
              <div className="md:col-span-5 md:pt-4">
                <p className="max-w-md text-body-lg text-[color:var(--color-muted)]">
                  {chapter.copy}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
