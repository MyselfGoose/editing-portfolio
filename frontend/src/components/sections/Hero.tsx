"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE } from "@/lib/constants";
import { heroStagger, heroWordVariant } from "@/lib/motion-presets";

import { HeroAudioToggle } from "./HeroAudioToggle";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroMediaProvider, useHeroMedia } from "./HeroMediaContext";

const HEADLINE_LINES: ReadonlyArray<ReadonlyArray<string>> = [
  ["We", "don't"],
  ["edit", "videos."],
  ["We", "create"],
  ["memories."],
];

function HeroContent(): React.ReactElement {
  const reducedMotion = usePrefersReducedMotion();
  const { tier, isDesktop, finePointer, isHydrated } = useBreakpoint();
  const { isMuted } = useHeroMedia();
  const showVideo =
    isHydrated && isDesktop && finePointer && !reducedMotion;
  const parentVariant = heroStagger(tier, reducedMotion);
  const childVariant = heroWordVariant(tier, reducedMotion);

  const contentOpacity = isMuted || !showVideo ? 1 : 0.28;
  const contentTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.9, ease: EASE.cinematic };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden px-[var(--section-px)] pb-8 pt-20 sm:pb-14 sm:pt-24 lg:pb-14 lg:pt-8"
      aria-labelledby="hero-heading"
    >
      <HeroBackdrop />

      <motion.header
        className="relative z-10 flex items-center justify-between"
        animate={{ opacity: contentOpacity }}
        transition={contentTransition}
      >
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          Cinematic Studio / Est. 2019
        </span>
        <span className="text-eyebrow text-[color:var(--color-muted)] hidden sm:inline">
          Reel 01 / 03
        </span>
      </motion.header>

      <Container className="relative z-10 py-6 sm:py-10">
        <motion.div
          animate={{ opacity: contentOpacity }}
          transition={contentTransition}
        >
          <motion.h1
            id="hero-heading"
            className="font-display text-massive"
            variants={parentVariant}
            initial={reducedMotion ? undefined : "hidden"}
            animate={reducedMotion ? undefined : "visible"}
          >
            {HEADLINE_LINES.map((line, lineIndex) => (
              <span
                key={lineIndex}
                className="flex flex-wrap gap-x-[0.28em] gap-y-0"
              >
                {line.map((word, wordIndex) => (
                  <span key={`${lineIndex}-${wordIndex}`} className="word-mask">
                    <motion.span variants={childVariant}>{word}</motion.span>
                  </span>
                ))}
              </span>
            ))}
          </motion.h1>
        </motion.div>
      </Container>

      <motion.footer
        className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8"
        animate={{ opacity: contentOpacity }}
        transition={contentTransition}
      >
        <motion.p
          className="max-w-sm text-body-lg text-[color:var(--color-muted)]"
          initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.expoOut, delay: 1.4 }}
        >
          A film-first studio built around emotion, silence, and pacing.
          Editing, color, motion &mdash; treated as one craft.
        </motion.p>

        <div className="flex w-full flex-col items-stretch gap-4 sm:w-auto sm:items-end">
          {showVideo ? <HeroAudioToggle /> : null}
          <motion.div
            className="flex flex-col items-start gap-2 text-eyebrow text-[color:var(--color-muted)] sm:items-end"
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={reducedMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE.expoOut, delay: 1.6 }}
            aria-hidden="true"
          >
            <span>Scroll</span>
            <ArrowDown size={16} strokeWidth={1.25} />
          </motion.div>
        </div>
      </motion.footer>
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
