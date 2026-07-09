"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { Container } from "@/components/layout/Container";
import { MediaFrame } from "@/components/layout/MediaFrame";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MUX_IMAGE_SIZES, posterWidthForTier } from "@/lib/breakpoints";
import { MUX_DEMO_VIDEO } from "@/lib/constants";
import { posterUrl } from "@/lib/mux";
import { cn } from "@/lib/utils";
import { formatIndex } from "@/lib/utils";

interface ProcessFrame {
  index: number;
  phase: string;
  eyebrow: string;
  craft: string;
  title: string;
  copy: string;
  playbackId: string;
  posterTime: number;
  filter: string;
}

const FRAMES: ReadonlyArray<ProcessFrame> = [
  {
    index: 1,
    phase: "SELECTS",
    eyebrow: "INGEST / SELECTS",
    craft: "Editorial",
    title: "We find what matters.",
    copy: "Every project begins in the footage — hours of moments, gestures, and light. We review, log, and build selects around the emotional spine of the story before a single cut is made.",
    playbackId: MUX_DEMO_VIDEO.playbackId,
    posterTime: 6,
    filter: "saturate(0.55) contrast(1.05) brightness(0.88)",
  },
  {
    index: 2,
    phase: "GRADE",
    eyebrow: "EDIT / GRADE",
    craft: "Color",
    title: "Picture and color tell the feeling.",
    copy: "Assembly, pacing, and grade work as one language. Contrast, temperature, and grain are shaped to carry mood — not applied as a filter, but built as atmosphere.",
    playbackId: "01pLE9oSaFRESO6zzy7lXGcR01di3hz1BTbLM1ye4eRWk",
    posterTime: 24,
    filter: "saturate(0.85) contrast(1.1) brightness(0.95)",
  },
  {
    index: 3,
    phase: "DELIVER",
    eyebrow: "SOUND / DELIVERY",
    craft: "Delivery",
    title: "The film leaves the timeline.",
    copy: "Sound design, mix, and final polish. The film is mastered for every screen it will live on — from cinema-scale displays to the phone in someone's pocket.",
    playbackId: "mYoZjovjdBNNfNbPLGnCzCAQrXLw2ItEbBc8T9m746M",
    posterTime: 12,
    filter: "saturate(1.05) contrast(1.05) brightness(1)",
  },
];

const PHASES = FRAMES.map((f) => f.phase);

export function Process(): React.ReactElement {
  const reducedMotion = usePrefersReducedMotion();
  const { isDesktop, finePointer, isHydrated } = useBreakpoint();
  const enableScrub =
    isHydrated && isDesktop && finePointer && !reducedMotion;

  return (
    <section
      id="process"
      className="relative w-full bg-[color:var(--color-background)]"
      aria-labelledby="process-heading"
    >
      <h2 id="process-heading" className="sr-only">
        Our process
      </h2>

      {enableScrub ? (
        <ProcessDesktopScrub frames={FRAMES} />
      ) : (
        <ProcessMobileStory frames={FRAMES} />
      )}
    </section>
  );
}

interface ProcessFramesProps {
  frames: ReadonlyArray<ProcessFrame>;
}

interface PhaseRailProps {
  frames: ReadonlyArray<ProcessFrame>;
  activeIndex: number;
}

function PhaseRail({ frames, activeIndex }: PhaseRailProps): React.ReactElement {
  return (
    <div
      className="flex flex-wrap items-center gap-2 sm:gap-3"
      aria-hidden="true"
    >
      {frames.map((frame, i) => (
        <span key={frame.phase} className="flex items-center gap-2 sm:gap-3">
          {i > 0 ? (
            <span className="text-[color:var(--color-divider)]">→</span>
          ) : null}
          <span
            className={cn(
              "text-eyebrow transition-colors duration-300",
              i === activeIndex
                ? "text-[color:var(--color-foreground)]"
                : "text-[color:var(--color-dim)]",
            )}
          >
            {frame.phase}
          </span>
        </span>
      ))}
    </div>
  );
}

function ProcessDesktopScrub({
  frames,
}: ProcessFramesProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const visualsRef = useRef<Array<HTMLDivElement | null>>([]);
  const textsRef = useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { tier } = useBreakpoint();
  const posterWidth = posterWidthForTier(tier);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      const visuals = visualsRef.current.filter(
        (el): el is HTMLDivElement => el !== null,
      );
      const texts = textsRef.current.filter(
        (el): el is HTMLDivElement => el !== null,
      );
      const progressBar = progressRef.current;
      if (!root || !track || visuals.length === 0 || texts.length === 0) return;

      gsap.set(visuals, { opacity: (i: number) => (i === 0 ? 1 : 0) });
      gsap.set(texts, {
        opacity: (i: number) => (i === 0 ? 1 : 0),
        y: (i: number) => (i === 0 ? 0 : 24),
      });
      if (progressBar) {
        gsap.set(progressBar, { scaleX: 0, transformOrigin: "left center" });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${window.innerHeight * (frames.length + 0.5)}`,
          scrub: 1,
          pin: track,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              frames.length - 1,
              Math.floor(self.progress * frames.length),
            );
            setActiveIndex(idx);
          },
        },
      });

      for (let i = 0; i < frames.length - 1; i += 1) {
        const position = i + 1;
        tl.to(
          visuals[i],
          { opacity: 0, duration: 1, ease: "power2.inOut" },
          position,
        )
          .to(
            visuals[i + 1],
            { opacity: 1, duration: 1, ease: "power2.inOut" },
            position,
          )
          .to(
            texts[i],
            { opacity: 0, y: -16, duration: 1, ease: "power2.inOut" },
            position,
          )
          .to(
            texts[i + 1],
            { opacity: 1, y: 0, duration: 1, ease: "power2.inOut" },
            position,
          );
      }

      if (progressBar) {
        tl.to(
          progressBar,
          { scaleX: 1, ease: "none", duration: frames.length - 1 },
          0,
        );
      }

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        ScrollTrigger.refresh();
      };
    },
    { dependencies: [frames.length], scope: rootRef },
  );

  return (
    <div ref={rootRef}>
      <div
        ref={trackRef}
        className="relative flex h-[100svh] w-full flex-col overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-4 px-[var(--section-px)] pt-8">
          <div className="flex items-center justify-between">
            <span className="text-eyebrow text-[color:var(--color-muted)]">
              02 / The Process / Post-Production
            </span>
            <span className="text-eyebrow text-[color:var(--color-muted)]">
              Stage {formatIndex(activeIndex + 1, 2)} /{" "}
              {formatIndex(frames.length, 2)}
            </span>
          </div>
          <PhaseRail frames={frames} activeIndex={activeIndex} />
        </div>

        <Container className="grid flex-1 grid-cols-1 items-center gap-8 pb-20 pt-28 md:grid-cols-2 md:gap-16 md:pt-32">
          <MediaFrame
            aspectRatio="4/3"
            className="border border-[color:var(--color-divider)]"
          >
            {frames.map((frame, i) => (
              <div
                key={`visual-${frame.index}`}
                ref={(el: HTMLDivElement | null) => {
                  visualsRef.current[i] = el;
                }}
                className="absolute inset-0"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <FrameImage frame={frame} posterWidth={posterWidth} />
              </div>
            ))}
          </MediaFrame>

          <div className="relative min-h-[300px] md:min-h-[340px]">
            {frames.map((frame, i) => (
              <div
                key={`text-${frame.index}`}
                ref={(el: HTMLDivElement | null) => {
                  textsRef.current[i] = el;
                }}
                className="absolute inset-0 flex flex-col justify-center gap-6"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <FrameCopy frame={frame} total={frames.length} />
              </div>
            ))}
          </div>
        </Container>

        <div className="absolute inset-x-[var(--section-px)] bottom-8 z-20">
          <div className="mb-3 flex justify-between gap-2">
            {PHASES.map((phase, i) => (
              <span
                key={phase}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  i <= activeIndex
                    ? "bg-[color:var(--color-foreground)]"
                    : "bg-[color:var(--color-divider)]",
                )}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="h-px w-full bg-[color:var(--color-divider)]">
            <div
              ref={progressRef}
              className="h-px w-full bg-[color:var(--color-foreground)]"
              style={{ transformOrigin: "left center" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessMobileStory({
  frames,
}: ProcessFramesProps): React.ReactElement {
  const { tier } = useBreakpoint();
  const posterWidth = posterWidthForTier(tier);
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  const updateActiveIndex = useCallback((): void => {
    const viewportMid = window.innerHeight * 0.42;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    stepRefs.current.forEach((el, index) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const distance = Math.abs(mid - viewportMid);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const onScroll = (): void => {
      updateActiveIndex();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateActiveIndex]);

  const progress = frames.length > 1 ? activeIndex / (frames.length - 1) : 0;

  return (
    <div className="relative">
      <Container className="flex flex-col gap-4 pb-8 pt-[var(--section-py)]">
        <div className="flex items-center justify-between">
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            02 / The Process / Post-Production
          </span>
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            Stage {formatIndex(activeIndex + 1, 2)} /{" "}
            {formatIndex(frames.length, 2)}
          </span>
        </div>
        <PhaseRail frames={frames} activeIndex={activeIndex} />
      </Container>

      <div className="sticky top-[4.5rem] z-10 px-[var(--section-px)]">
        <MediaFrame
          aspectRatio="4/3"
          className="border border-[color:var(--color-divider)] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        >
          {frames.map((frame, i) => (
            <motion.div
              key={`mobile-visual-${frame.index}`}
              className="absolute inset-0"
              animate={{ opacity: i === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <FrameImage frame={frame} posterWidth={posterWidth} />
            </motion.div>
          ))}
        </MediaFrame>

        <div className="mt-4 flex justify-between gap-2">
          {PHASES.map((phase, i) => (
            <span
              key={phase}
              className={cn(
                "text-eyebrow transition-colors duration-300",
                i === activeIndex
                  ? "text-[color:var(--color-foreground)]"
                  : "text-[color:var(--color-dim)]",
              )}
            >
              {phase}
            </span>
          ))}
        </div>

        <div className="mt-3 h-px w-full bg-[color:var(--color-divider)]">
          <motion.div
            className="h-px bg-[color:var(--color-foreground)]"
            style={{ transformOrigin: "left center" }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <Container className="flex flex-col">
        {frames.map((frame, i) => (
          <MobileProcessStep
            key={frame.index}
            frame={frame}
            index={i}
            total={frames.length}
            isActive={i === activeIndex}
            ref={(el: HTMLElement | null) => {
              stepRefs.current[i] = el;
            }}
          />
        ))}
      </Container>
    </div>
  );
}

interface MobileProcessStepProps {
  frame: ProcessFrame;
  index: number;
  total: number;
  isActive: boolean;
}

const MobileProcessStep = forwardRef<HTMLElement, MobileProcessStepProps>(
  function MobileProcessStep(
    { frame, index, total, isActive },
    ref,
  ): React.ReactElement {
    return (
      <article
        ref={ref}
        className="flex min-h-[55svh] flex-col justify-center gap-5 py-10"
        aria-current={isActive ? "step" : undefined}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors duration-300",
              isActive
                ? "bg-[color:var(--color-foreground)]"
                : "bg-[color:var(--color-divider)]",
            )}
            aria-hidden="true"
          />
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            {frame.eyebrow}
          </span>
          <span className="font-mono text-xs text-[color:var(--color-dim)]">
            {frame.craft}
          </span>
        </div>
        <h3
          className={cn(
            "font-display text-headline transition-opacity duration-300",
            isActive ? "opacity-100" : "opacity-40",
          )}
        >
          {frame.title}
        </h3>
        <p
          className={cn(
            "max-w-md text-body-lg transition-opacity duration-300",
            isActive
              ? "text-[color:var(--color-muted)] opacity-100"
              : "text-[color:var(--color-dim)] opacity-60",
          )}
        >
          {frame.copy}
        </p>
        <p className="font-mono text-xs text-[color:var(--color-dim)]">
          Stage {formatIndex(index + 1, 2)} / {formatIndex(total, 2)}
        </p>
      </article>
    );
  },
);

interface FrameImageProps {
  frame: ProcessFrame;
  posterWidth: number;
}

function FrameImage({
  frame,
  posterWidth,
}: FrameImageProps): React.ReactElement {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterUrl(frame.playbackId, {
          time: frame.posterTime,
          width: posterWidth,
        })}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        sizes={MUX_IMAGE_SIZES}
        style={{ filter: frame.filter }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          {frame.eyebrow}
        </span>
      </div>
    </>
  );
}

interface FrameCopyProps {
  frame: ProcessFrame;
  total: number;
}

function FrameCopy({ frame, total }: FrameCopyProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          {frame.eyebrow}
        </span>
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[color:var(--color-dim)]">
          <span>Stage {formatIndex(frame.index, 2)} / {formatIndex(total, 2)}</span>
          <span aria-hidden="true">·</span>
          <span>{frame.craft}</span>
        </div>
      </div>
      <h3 className="font-display text-headline">{frame.title}</h3>
      <p className="max-w-md text-body-lg text-[color:var(--color-muted)]">
        {frame.copy}
      </p>
    </div>
  );
}
