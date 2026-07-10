"use client";

import { motion } from "motion/react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Stack } from "@/components/layout/Stack";
import { MediaFrame } from "@/components/layout/MediaFrame";
import { useHydrationSafeBreakpoint } from "@/hooks/useHydrationSafeBreakpoint";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import { MUX_IMAGE_SIZES, posterWidthForTier } from "@/lib/breakpoints";
import { ABOUT_STILL, EASE } from "@/lib/constants";
import { posterUrl } from "@/lib/mux";

const PULL_QUOTE =
  "Every frame is chosen for the emotion it holds, not the effect it lands.";

export function About(): React.ReactElement {
  const { tier } = useHydrationSafeBreakpoint();
  const revealMotion = useRevealMotion();
  const posterWidth = posterWidthForTier(tier);
  const still = posterUrl(ABOUT_STILL.playbackId, {
    time: ABOUT_STILL.time,
    width: posterWidth,
  });

  return (
    <Section id="about" labelledBy="about-heading" borderTop>
      <motion.span
        className="pointer-events-none absolute -left-4 top-16 hidden select-none font-display text-[clamp(6rem,22vw,18rem)] leading-none text-[color:var(--color-foreground)] opacity-[0.03] md:block"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.03 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE.cinematic }}
        aria-hidden="true"
      >
        ABOUT
      </motion.span>

      <Container>
        <SectionHeader label="01 / About" aside="Studio Note" />

        <div className="relative mt-12 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-12 md:gap-16">
          <motion.div
            className="md:col-span-4 md:sticky md:top-24 md:self-start"
            variants={revealMotion.variants}
            initial={revealMotion.initial}
            whileInView="visible"
            viewport={{ once: true, margin: "-15% 0px" }}
          >
            <MediaFrame aspectRatio="3/4" className="w-full border border-[color:var(--color-divider)] md:max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={still}
                alt={ABOUT_STILL.alt}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                sizes={MUX_IMAGE_SIZES}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-eyebrow text-[color:var(--color-muted)]">
                Still / 00:04
              </span>
            </MediaFrame>
          </motion.div>

          <Stack gap="lg" className="md:col-span-8">
            <motion.h2
              id="about-heading"
              className="font-display text-headline max-w-3xl"
              variants={revealMotion.variants}
              initial={revealMotion.initial}
              whileInView="visible"
              viewport={{ once: true, margin: "-20% 0px" }}
            >
              A studio for stories that need to be felt&mdash;not just watched.
            </motion.h2>

            <motion.blockquote
              className="border-l border-[color:var(--color-foreground)] pl-5 font-display text-chapter leading-snug text-[color:var(--color-foreground)] sm:pl-6 sm:text-cta"
              variants={revealMotion.variants}
              initial={revealMotion.initial}
              whileInView="visible"
              viewport={{ once: true, margin: "-15% 0px" }}
            >
              {PULL_QUOTE}
            </motion.blockquote>

            <motion.div
              className="flex flex-col gap-6 text-body-lg text-[color:var(--color-muted)]"
              variants={revealMotion.variants}
              initial={revealMotion.initial}
              whileInView="visible"
              viewport={{ once: true, margin: "-15% 0px" }}
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
              className="text-meta border-t border-[color:var(--color-divider)] pt-6 uppercase text-[color:var(--color-dim)] text-balance"
              variants={revealMotion.variants}
              initial={revealMotion.initial}
              whileInView="visible"
              viewport={{ once: true }}
            >
              Est. 2019 &mdash; Southern California &mdash; Worldwide &mdash; Remote-first
            </motion.p>
          </Stack>
        </div>
      </Container>
    </Section>
  );
}
