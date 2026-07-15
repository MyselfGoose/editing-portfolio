"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

import { useHydrationSafeBreakpoint } from "@/hooks/useHydrationSafeBreakpoint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE } from "@/lib/constants";

interface FilmsHeroProps {
  filmCount: number;
  yearRange: { earliest: number; latest: number };
}

export function FilmsHero({
  filmCount,
  yearRange,
}: FilmsHeroProps): React.ReactElement {
  const reducedMotion = usePrefersReducedMotion();
  const { isMobile } = useHydrationSafeBreakpoint();

  const titleWords = ["Films"];
  const yearLabel =
    yearRange.earliest === yearRange.latest
      ? String(yearRange.latest)
      : `${yearRange.earliest}–${yearRange.latest}`;

  return (
    <section
      id="films-hero"
      className="relative flex min-h-[80svh] w-full flex-col overflow-hidden px-[var(--section-px)] pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(5rem,calc(var(--nav-offset)+2rem))] sm:min-h-[85svh] sm:pb-14 lg:min-h-[90svh] lg:pb-14"
      aria-labelledby="films-hero-heading"
    >
      <motion.header
        className="relative z-10 flex items-center justify-between"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { duration: 0.8, ease: EASE.cinematic, delay: 0.2 }
        }
      >
        <span className="text-meta uppercase text-[color:var(--color-muted)]">
          Studio Archive / {yearLabel}
        </span>
        <span className="text-meta uppercase text-[color:var(--color-muted)]">
          {isMobile
            ? `${filmCount} Films`
            : `${filmCount} Films / Collection`}
        </span>
      </motion.header>

      <div className="relative z-10 flex flex-1 items-center py-6 sm:py-10">
        <motion.h1
          id="films-hero-heading"
          className="font-display text-massive w-full text-[color:var(--color-foreground)]"
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 1, ease: EASE.expoOut, delay: 0.3 }
          }
        >
          {titleWords.map((word, i) => (
            <span key={i} className="word-mask">
              <motion.span
                className="inline-block"
                initial={reducedMotion ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 1,
                        ease: EASE.expoOut,
                        delay: 0.4 + i * 0.08,
                      }
                }
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>
      </div>

      <footer className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <motion.p
          className="max-w-md text-body-lg text-[color:var(--color-muted)]"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.9, ease: EASE.expoOut, delay: 0.8 }
          }
        >
          A curated collection of cinematic stories — weddings, celebrations,
          and brand narratives crafted with intention.
        </motion.p>

        <motion.div
          className="flex flex-col items-start gap-2 text-eyebrow text-[color:var(--color-muted)] sm:items-end"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.8, ease: EASE.cinematic, delay: 1 }
          }
          aria-hidden="true"
        >
          <span>Scroll</span>
          <ArrowDown size={16} strokeWidth={1.25} />
        </motion.div>
      </footer>
    </section>
  );
}
