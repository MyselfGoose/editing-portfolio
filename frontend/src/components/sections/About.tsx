"use client";

import { motion } from "motion/react";

import { EASE, MUX_DEMO_VIDEO } from "@/lib/constants";
import { MUX_IMAGE_DEFAULTS, posterUrl } from "@/lib/mux";

const PULL_QUOTE =
  "Every frame is chosen for the emotion it holds, not the effect it lands.";

export function About(): React.ReactElement {
  const still = posterUrl(MUX_DEMO_VIDEO.playbackId, {
    time: 4,
    width: MUX_IMAGE_DEFAULTS.posterWidth,
  });

  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-[color:var(--color-divider)] px-6 py-24 sm:px-10 sm:py-32"
      aria-labelledby="about-heading"
    >
      <motion.span
        className="pointer-events-none absolute -left-4 top-16 select-none font-display text-[clamp(6rem,22vw,18rem)] leading-none text-[color:var(--color-foreground)] opacity-[0.03]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.03 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE.cinematic }}
        aria-hidden="true"
      >
        ABOUT
      </motion.span>

      <header className="relative flex items-baseline justify-between">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          01 / About
        </span>
        <span className="text-eyebrow text-[color:var(--color-muted)] hidden sm:inline">
          Studio Note
        </span>
      </header>

      <div className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
        <motion.div
          className="md:col-span-4 md:sticky md:top-24 md:self-start"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease: EASE.expoOut, delay: 0.05 }}
        >
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden border border-[color:var(--color-divider)] bg-[color:var(--color-elevated)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={still}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 text-eyebrow text-[color:var(--color-muted)]">
              Still / 00:04
            </span>
          </div>
        </motion.div>

        <div className="md:col-span-8 flex flex-col gap-10">
          <motion.h2
            id="about-heading"
            className="font-display text-headline max-w-3xl"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1.1, ease: EASE.expoOut, delay: 0.1 }}
          >
            A studio for stories that need to be felt&mdash;not just watched.
          </motion.h2>

          <motion.blockquote
            className="border-l border-[color:var(--color-foreground)] pl-6 font-display text-2xl leading-snug text-[color:var(--color-foreground)] sm:text-3xl"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: EASE.expoOut, delay: 0.15 }}
          >
            {PULL_QUOTE}
          </motion.blockquote>

          <motion.div
            className="flex flex-col gap-6 text-base leading-relaxed text-[color:var(--color-muted)]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: EASE.expoOut, delay: 0.2 }}
          >
            <p>
              We treat editing, color and motion as one craft. Every cut earns
              its place. Every silence carries weight.
            </p>
            <p>
              The work moves slowly on purpose. We spend as much time watching
              the raw footage as most studios spend cutting. What survives feels
              inevitable.
            </p>
          </motion.div>

          <motion.p
            className="border-t border-[color:var(--color-divider)] pt-6 font-mono text-xs tracking-[0.2em] text-[color:var(--color-dim)] uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE.smooth, delay: 0.25 }}
          >
            Est. 2019 &mdash; [CITY] &mdash; Worldwide &mdash; Remote-first
          </motion.p>
        </div>
      </div>
    </section>
  );
}
