"use client";

import { motion } from "motion/react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { EASE } from "@/lib/constants";
import { sectionReveal } from "@/lib/motion-presets";
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
    copy: "Understanding the emotion before touching the timeline. We start with the intent, the audience, and the arc. Everything downstream serves that.",
  },
  {
    index: 2,
    title: "Editing.",
    copy: "Every cut exists for a reason. Pacing, silence, tension, release. The edit is the story; everything else is finish.",
  },
  {
    index: 3,
    title: "Color.",
    copy: "Turning footage into atmosphere. Grade for mood, not for trend. Skin lives, blacks breathe, highlights hold.",
  },
  {
    index: 4,
    title: "Delivery.",
    copy: "Formats, exports, archive. The film leaves the timeline and enters the world cleanly — ready for every screen it will live on.",
  },
  {
    index: 5,
    title: "Refinement.",
    copy: "Client notes, revision rounds, fine cut. The edit sharpens until it feels inevitable — not just approved.",
  },
];

export function Services(): React.ReactElement {
  const { tier } = useBreakpoint();
  const reveal = sectionReveal(tier);

  return (
    <Section id="services" labelledBy="services-heading" borderTop>
      <Container>
        <SectionHeader label="03 / Craft" aside="Chapters of a process" />

        <h2
          id="services-heading"
          className="font-display mt-10 text-headline max-w-3xl sm:mt-12"
        >
          Five chapters. One craft.
        </h2>

        <ol className="mt-16 divide-y divide-[color:var(--color-divider)]">
          {CHAPTERS.map((chapter) => (
            <motion.li
              key={chapter.index}
              className="grid grid-cols-1 gap-4 py-12 sm:gap-6 sm:py-16 md:grid-cols-12 md:gap-10"
              variants={reveal}
              initial="hidden"
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
