"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { useCallback, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useCinematicCapabilities } from "@/lib/cinematic-capabilities";
import { EASE, HEADLINE_LINES, SHOWREEL } from "@/lib/constants";

import { HeroAudioToggle } from "./HeroAudioToggle";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroMediaProvider, useHeroMedia } from "./HeroMediaContext";

const ShowreelOverlay = dynamic(
  () =>
    import("@/components/showreel/ShowreelOverlay").then(
      (m) => m.ShowreelOverlay,
    ),
  { ssr: false },
);

/** Secondary chrome/subcopy opacity when ambient video is unmuted. */
const SECONDARY_FADE_OPACITY = 0.65;

function HeroContent(): React.ReactElement {
  const reducedMotion = usePrefersReducedMotion();
  const { canPlayAmbientVideo } = useCinematicCapabilities();
  const { isMuted, pauseAmbient, resumeAmbient } = useHeroMedia();
  const [reelOpen, setReelOpen] = useState(false);

  const secondaryOpacity =
    isMuted || !canPlayAmbientVideo ? 1 : SECONDARY_FADE_OPACITY;
  const textTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.9, ease: EASE.cinematic };

  const headlineEnter = reducedMotion
    ? { opacity: 1 }
    : {
        opacity: 1,
        y: 0,
        transition: {
          opacity: textTransition,
          y: { duration: 1, ease: EASE.expoOut, delay: 0.25 },
        },
      };

  const openReel = useCallback((): void => {
    setReelOpen(true);
  }, []);

  const closeReel = useCallback((): void => {
    setReelOpen(false);
  }, []);

  const handleAmbientPause = useCallback(
    (paused: boolean): void => {
      if (paused) {
        pauseAmbient();
      } else {
        resumeAmbient();
      }
    },
    [pauseAmbient, resumeAmbient],
  );

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden px-[var(--section-px)] pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(5rem,calc(var(--nav-offset)+0.5rem))] sm:pb-14 sm:pt-24 lg:pb-14 lg:pt-8"
      aria-labelledby="hero-heading"
    >
      <HeroBackdrop />

      {canPlayAmbientVideo ? (
        <div
          className="pointer-events-none absolute inset-0 z-[5] bg-[linear-gradient(90deg,rgba(10,10,10,0.55)_0%,rgba(10,10,10,0.15)_45%,transparent_70%),linear-gradient(180deg,transparent_40%,rgba(10,10,10,0.5)_100%)]"
          aria-hidden="true"
        />
      ) : null}

      <motion.header
        className="relative z-10 flex items-center justify-between"
        animate={{ opacity: secondaryOpacity }}
        transition={textTransition}
      >
        <span className="text-meta uppercase text-[color:var(--color-muted)]">
          Wedding Cinema / Est. 2019
        </span>
        {/* Header CTA only below lg — DesktopNav occupies top-right on large screens */}
        <button
          type="button"
          onClick={openReel}
          className="min-h-11 text-meta uppercase text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-foreground)] lg:hidden"
          aria-label={SHOWREEL.ctaLabel}
        >
          {SHOWREEL.ctaLabel}
        </button>
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
        <div className="flex max-w-sm flex-col gap-5">
          <motion.p
            className="text-body-lg text-[color:var(--color-muted)]"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: secondaryOpacity, y: 0 }}
            transition={
              reducedMotion
                ? textTransition
                : {
                    opacity: textTransition,
                    y: { duration: 0.9, ease: EASE.expoOut, delay: 1.4 },
                  }
            }
          >
            Cinematic wedding films for couples who want the day felt, not just
            filmed. Selected work from the archive below.
          </motion.p>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: secondaryOpacity }}
            transition={
              reducedMotion
                ? textTransition
                : { ...textTransition, delay: 1.5 }
            }
          >
            <button
              type="button"
              onClick={openReel}
              className="inline-flex min-h-11 items-center border-b border-[color:var(--color-foreground)] pb-2 text-eyebrow transition-colors hover:text-[color:var(--color-muted)]"
              aria-label={SHOWREEL.ctaLabel}
            >
              {SHOWREEL.ctaLabel}
            </button>
          </motion.div>
        </div>

        <motion.div
          className="flex flex-col items-start gap-2 text-eyebrow text-[color:var(--color-muted)] sm:items-end"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: secondaryOpacity }}
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

      {canPlayAmbientVideo ? (
        <div className="absolute bottom-8 right-[var(--section-px)] z-20 pb-[env(safe-area-inset-bottom)]">
          <HeroAudioToggle />
        </div>
      ) : null}

      <ShowreelOverlay
        open={reelOpen}
        onClose={closeReel}
        onOpenChangeAmbient={handleAmbientPause}
      />
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
