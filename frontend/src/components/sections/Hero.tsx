"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE } from "@/lib/constants";

import { HeroAudioToggle } from "./HeroAudioToggle";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroMediaProvider, useHeroMedia } from "./HeroMediaContext";

const HEADLINE_LINES: ReadonlyArray<ReadonlyArray<string>> = [
  ["We", "don't"],
  ["edit", "videos."],
  ["We", "create"],
  ["memories."],
];

const TEXT_FADE_OPACITY = 0.1;

function HeroContent(): React.ReactElement {
  const reducedMotion = usePrefersReducedMotion();
  const { isDesktop, finePointer, isHydrated } = useBreakpoint();
  const { isMuted } = useHeroMedia();
  const showVideo =
    isHydrated && isDesktop && finePointer && !reducedMotion;

  const textOpacity = isMuted || !showVideo ? 1 : TEXT_FADE_OPACITY;
  const textTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.9, ease: EASE.cinematic };

  const headlineEnter = reducedMotion
    ? { opacity: textOpacity }
    : {
        opacity: textOpacity,
        y: 0,
        transition: {
          opacity: textTransition,
          y: { duration: 1, ease: EASE.expoOut, delay: 0.25 },
        },
      };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden px-[var(--section-px)] pb-8 pt-20 sm:pb-14 sm:pt-24 lg:pb-14 lg:pt-8"
      aria-labelledby="hero-heading"
    >
      <HeroBackdrop />

      <motion.header
        className="relative z-10 flex items-center justify-between"
        animate={{ opacity: textOpacity }}
        transition={textTransition}
      >
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          Cinematic Studio / Est. 2019
        </span>
        <span className="text-eyebrow text-[color:var(--color-muted)] hidden sm:inline">
          Reel 01 / 04
        </span>
      </motion.header>

      <div className="relative z-10 flex flex-1 items-center py-6 sm:py-10">
        <motion.h1
          id="hero-heading"
          className="font-display text-massive w-full max-w-5xl text-[color:var(--color-foreground)]"
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          animate={headlineEnter}
        >
          {HEADLINE_LINES.map((line, lineIndex) => (
            <span
              key={lineIndex}
              className="flex flex-wrap gap-x-[0.28em] gap-y-0"
            >
              {line.map((word, wordIndex) => (
                <span key={`${lineIndex}-${wordIndex}`}>{word}</span>
              ))}
            </span>
          ))}
        </motion.h1>
      </div>

      <footer className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <motion.p
          className="max-w-sm text-body-lg text-[color:var(--color-muted)]"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: textOpacity, y: 0 }}
          transition={
            reducedMotion
              ? textTransition
              : {
                  opacity: textTransition,
                  y: { duration: 0.9, ease: EASE.expoOut, delay: 1.4 },
                }
          }
        >
          A film-first studio built around emotion, silence, and pacing.
          Editing, color, motion &mdash; treated as one craft.
        </motion.p>

        <motion.div
          className="flex flex-col items-start gap-2 text-eyebrow text-[color:var(--color-muted)] sm:items-end"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: textOpacity }}
          transition={
            reducedMotion
              ? textTransition
              : { ...textTransition, delay: 1.6 }
          }
          aria-hidden="true"
        >
          <span>Scroll</span>
          <ArrowDown size={16} strokeWidth={1.25} />
        </motion.div>
      </footer>

      {showVideo ? (
        <div className="absolute bottom-8 right-[var(--section-px)] z-20">
          <HeroAudioToggle />
        </div>
      ) : null}
    </section>
  );
}

export function Hero(): React.ReactElement {
  return (
    <HeroMediaProvider>
      <HeroContent />
    </HeroMediaProvider>
  );
}
