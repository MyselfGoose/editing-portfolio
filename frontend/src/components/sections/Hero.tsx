"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { maskedWord, staggerParent } from "@/lib/animations";
import { EASE } from "@/lib/constants";

import { HeroBackdrop } from "./HeroBackdrop";

const HEADLINE_LINES: ReadonlyArray<ReadonlyArray<string>> = [
  ["We", "don't"],
  ["edit", "videos."],
  ["We", "create"],
  ["memories."],
];

export function Hero(): React.ReactElement {
  const reducedMotion = usePrefersReducedMotion();
  const parentVariant = reducedMotion
    ? undefined
    : staggerParent(0.09, 0.35);
  const childVariant = reducedMotion ? undefined : maskedWord;

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden pt-6 pb-10 sm:pt-8 sm:pb-14"
      aria-labelledby="hero-heading"
    >
      <HeroBackdrop />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          Cinematic Studio / Est. 2019
        </span>
        <span className="text-eyebrow text-[color:var(--color-muted)] hidden sm:inline">
          Reel 01 / 03
        </span>
      </header>

      <div className="relative z-10 px-6 sm:px-10">
        <motion.h1
          id="hero-heading"
          className="font-display text-massive"
          variants={parentVariant}
          initial={reducedMotion ? undefined : "hidden"}
          animate={reducedMotion ? undefined : "visible"}
        >
          {HEADLINE_LINES.map((line, lineIndex) => (
            <span key={lineIndex} className="block">
              {line.map((word, wordIndex) => (
                <span key={`${lineIndex}-${wordIndex}`} className="word-mask">
                  <motion.span variants={childVariant}>
                    {word}
                    {wordIndex < line.length - 1 ? "\u00A0" : ""}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </motion.h1>
      </div>

      <footer className="relative z-10 flex items-end justify-between gap-8 px-6 sm:px-10">
        <motion.p
          className="max-w-xs text-sm text-[color:var(--color-muted)] leading-relaxed"
          initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.expoOut, delay: 1.4 }}
        >
          A film-first studio built around emotion, silence, and pacing.
          Editing, color, motion &mdash; treated as one craft.
        </motion.p>

        <motion.div
          className="flex flex-col items-end gap-2 text-eyebrow text-[color:var(--color-muted)]"
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={reducedMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE.expoOut, delay: 1.6 }}
          aria-hidden="true"
        >
          <span>Scroll</span>
          <ArrowDown size={16} strokeWidth={1.25} />
        </motion.div>
      </footer>
    </section>
  );
}
