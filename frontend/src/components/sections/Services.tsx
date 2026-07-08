"use client";

import { motion } from "motion/react";

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
  return (
    <section
      id="services"
      className="relative border-t border-[color:var(--color-divider)] px-6 py-24 sm:px-10 sm:py-32"
      aria-labelledby="services-heading"
    >
      <header className="flex items-baseline justify-between">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          03 / Craft
        </span>
        <span className="text-eyebrow text-[color:var(--color-muted)] hidden sm:inline">
          Chapters of a process
        </span>
      </header>

      <h2
        id="services-heading"
        className="font-display mt-12 text-headline max-w-3xl"
      >
        Five chapters. One craft.
      </h2>

      <ol className="mt-16 divide-y divide-[color:var(--color-divider)]">
        {CHAPTERS.map((chapter) => (
          <motion.li
            key={chapter.index}
            className="grid grid-cols-1 gap-6 py-16 md:grid-cols-12 md:gap-10"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: EASE.expoOut }}
          >
            <div className="md:col-span-2 flex md:flex-col items-baseline md:items-start gap-4">
              <span className="font-mono text-xs text-[color:var(--color-dim)]">
                {formatIndex(chapter.index)}
              </span>
              <span className="text-eyebrow text-[color:var(--color-muted)] md:mt-2">
                Chapter {formatIndex(chapter.index)}
              </span>
            </div>
            <div className="md:col-span-5">
              <h3 className="font-display text-4xl leading-none sm:text-5xl md:text-6xl">
                {chapter.title}
              </h3>
            </div>
            <div className="md:col-span-5 md:pt-4">
              <p className="max-w-md text-base leading-relaxed text-[color:var(--color-muted)]">
                {chapter.copy}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
