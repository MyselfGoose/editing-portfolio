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
import { useHydrationSafeBreakpoint } from "@/hooks/useHydrationSafeBreakpoint";
import { useMounted } from "@/hooks/useMounted";
import { useCinematicCapabilities } from "@/lib/cinematic-capabilities";
import { MUX_IMAGE_SIZES, posterWidthForTier } from "@/lib/breakpoints";
import { posterUrl } from "@/lib/mux";
import { activeIndexFromTimelineProgress } from "@/lib/process-timeline";
import { refreshScrollLayout } from "@/lib/scroll-layout";
import { cn, formatIndex } from "@/lib/utils";

function resetFrameStyles(elements: ReadonlyArray<HTMLElement>): void {
  elements.forEach((el) => {
    el.style.removeProperty("visibility");
  });
}

function setInitialFrameAlpha(
  elements: ReadonlyArray<HTMLElement>,
  activeIndex: number,
): void {
  elements.forEach((el, index) => {
    gsap.set(el, { autoAlpha: index === activeIndex ? 1 : 0 });
  });
}

interface ProcessFrame {
  index: number;
  phase: string;
  eyebrow: string;
  craft: string;
  title: string;
  copy: string;
  media:
    | { type: "image"; src: string }
    | { type: "mux"; playbackId: string; posterTime: number };
  filter: string;
}

const FRAMES: ReadonlyArray<ProcessFrame> = [
  {
    index: 1,
    phase: "SELECTS",
    eyebrow: "INGEST / SELECTS",
    craft: "Editorial",
    title: "We find the best parts",
    copy: "Every project begins in the footage. Hours of footage are reviewed to find the very best moments and build a selection of clips that have the most impact.",
    media: { type: "image", src: "/images/cut.jpg" },
    filter: "none",
  },
  {
    index: 2,
    phase: "STRUCTURE",
    eyebrow: "EDIT / STRUCTURE",
    craft: "Editing",
    title: "The vision and structure are formed",
    copy: "We finalize the structure and the vision of the project and determine the exact length, feel and finish the edit would have.",
    media: {
      type: "mux",
      playbackId: "01pLE9oSaFRESO6zzy7lXGcR01di3hz1BTbLM1ye4eRWk",
      posterTime: 24,
    },
    filter: "saturate(0.75) contrast(1.08) brightness(0.92)",
  },
  {
    index: 3,
    phase: "GRADE",
    eyebrow: "COLOR / GRADE",
    craft: "Color",
    title: "Bringing out the colors",
    copy: "Assembly, pacing, and grade work as one language. Contrast, temperature, and grain are adjusted to carry mood. The visual look is finalized.",
    media: { type: "image", src: "/images/color.jpg" },
    filter: "none",
  },
  {
    index: 4,
    phase: "DELIVER",
    eyebrow: "SOUND / DELIVERY",
    craft: "Delivery",
    title: "The film leaves the timeline.",
    copy: "Sound design, color and the final polish are done. The film is ready for every screen that it will be presented on.",
    media: { type: "image", src: "/images/export.webp" },
    filter: "none",
  },
];

const PHASES = FRAMES.map((f) => f.phase);

let scrollTriggerMobileConfigured = false;

function configureScrollTriggerForMobile(): void {
  if (scrollTriggerMobileConfigured || typeof window === "undefined") return;
  ScrollTrigger.config({ ignoreMobileResize: true });
  scrollTriggerMobileConfigured = true;
}

export function Process(): React.ReactElement {
  const { canUseScrollScrub } = useCinematicCapabilities();

  return (
    <section
      id="process"
      className="relative w-full bg-[color:var(--color-background)]"
      aria-labelledby="process-heading"
    >
      <h2 id="process-heading" className="sr-only">
        Our process
      </h2>

      {canUseScrollScrub ? (
        <ProcessScrub frames={FRAMES} />
      ) : (
        <ProcessReducedMotion frames={FRAMES} />
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

const NAV_OFFSET_PX = 72;

function ProcessScrub({
  frames,
}: ProcessFramesProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const visualsRef = useRef<Array<HTMLDivElement | null>>([]);
  const textsRef = useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const mounted = useMounted();
  const { tier, isHydrated, isDesktop } = useHydrationSafeBreakpoint();
  const posterWidth = posterWidthForTier(tier);
  const scrubReady = mounted && isHydrated;
  const pinStart = isDesktop ? "top top" : `top ${NAV_OFFSET_PX}px`;

  useGSAP(
    () => {
      if (!scrubReady) return;

      configureScrollTriggerForMobile();

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

      resetFrameStyles(visuals);
      resetFrameStyles(texts);
      setInitialFrameAlpha(visuals, 0);
      setInitialFrameAlpha(texts, 0);
      gsap.set(texts, { y: (i: number) => (i === 0 ? 0 : 24) });
      if (progressBar) {
        gsap.set(progressBar, { scaleX: 0, transformOrigin: "left center" });
      }

      const timelineDuration = frames.length;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: pinStart,
          end: () => `+=${window.innerHeight * (frames.length + 0.5)}`,
          scrub: 1,
          pin: track,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => {
            setInitialFrameAlpha(visuals, activeIndexRef.current);
            setInitialFrameAlpha(texts, activeIndexRef.current);
          },
          onEnterBack: () => {
            setInitialFrameAlpha(visuals, activeIndexRef.current);
            setInitialFrameAlpha(texts, activeIndexRef.current);
          },
          onUpdate: (self) => {
            const idx = activeIndexFromTimelineProgress(
              self.progress,
              frames.length,
              timelineDuration,
            );
            if (idx !== activeIndexRef.current) {
              activeIndexRef.current = idx;
              setActiveIndex(idx);
            }
          },
        },
      });

      for (let i = 0; i < frames.length - 1; i += 1) {
        const position = i + 1;
        tl.to(
          visuals[i],
          { autoAlpha: 0, duration: 1, ease: "power2.inOut" },
          position,
        )
          .to(
            visuals[i + 1],
            { autoAlpha: 1, duration: 1, ease: "power2.inOut" },
            position,
          )
          .to(
            texts[i],
            { autoAlpha: 0, y: -16, duration: 1, ease: "power2.inOut" },
            position,
          )
          .to(
            texts[i + 1],
            { autoAlpha: 1, y: 0, duration: 1, ease: "power2.inOut" },
            position,
          );
      }

      if (progressBar) {
        tl.to(
          progressBar,
          { scaleX: 1, ease: "none", duration: timelineDuration },
          0,
        );
      }

      const handleLayoutChange = (): void => {
        refreshScrollLayout();
      };
      window.addEventListener("resize", handleLayoutChange, { passive: true });
      window.addEventListener("orientationchange", handleLayoutChange, {
        passive: true,
      });

      requestAnimationFrame(() => {
        refreshScrollLayout();
      });

      return () => {
        window.removeEventListener("resize", handleLayoutChange);
        window.removeEventListener("orientationchange", handleLayoutChange);
        resetFrameStyles(visuals);
        resetFrameStyles(texts);
        tl.scrollTrigger?.kill();
        tl.kill();
        refreshScrollLayout();
      };
    },
    { dependencies: [frames.length, pinStart, scrubReady], scope: rootRef },
  );

  return (
    <div ref={rootRef}>
      <div
        ref={trackRef}
        className="relative flex h-[100svh] w-full flex-col overflow-hidden supports-[height:100dvh]:h-[100dvh]"
      >
        <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-4 px-[var(--section-px)] pt-[calc(var(--nav-offset)+0.75rem)] lg:pt-[calc(var(--nav-offset)+0.5rem)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6 lg:pr-[min(14rem,30vw)]">
            <span className="text-eyebrow text-[color:var(--color-muted)]">
              02 / The Process / Post-Production
            </span>
            <span className="shrink-0 text-eyebrow text-[color:var(--color-muted)]">
              Stage {formatIndex(activeIndex + 1, 2)} /{" "}
              {formatIndex(frames.length, 2)}
            </span>
          </div>
          <PhaseRail frames={frames} activeIndex={activeIndex} />
        </div>

        <Container className="flex min-h-0 flex-1 flex-col items-start justify-start gap-5 px-[var(--section-px)] pb-24 pt-[calc(var(--nav-offset)+4.75rem)] sm:gap-6 sm:pb-20 sm:pt-28 md:grid md:grid-cols-2 md:items-center md:gap-16 md:px-0 md:pb-20 md:pt-32">
          <MediaFrame
            aspectRatio="4/3"
            className="w-full max-h-[38dvh] shrink-0 border border-[color:var(--color-divider)] md:max-h-none"
          >
            {frames.map((frame, i) => (
              <div
                key={`visual-${frame.index}`}
                ref={(el: HTMLDivElement | null) => {
                  visualsRef.current[i] = el;
                }}
                className="absolute inset-0"
                style={{ zIndex: i === activeIndex ? 2 : 1 }}
                aria-hidden={i !== activeIndex}
              >
                <FrameImage
                  frame={frame}
                  posterWidth={posterWidth}
                  priority={i === 0}
                />
              </div>
            ))}
          </MediaFrame>

          <div
            className="relative w-full min-h-0 flex-1 md:min-h-[340px] md:flex-none"
            data-active-stage={activeIndex}
          >
            {frames.map((frame, i) => (
              <div
                key={`text-${frame.index}`}
                ref={(el: HTMLDivElement | null) => {
                  textsRef.current[i] = el;
                }}
                className="absolute inset-0 flex flex-col justify-center gap-4 sm:gap-6"
                style={{ zIndex: i === activeIndex ? 2 : 1 }}
                aria-hidden={i !== activeIndex}
              >
                <FrameCopy frame={frame} total={frames.length} />
              </div>
            ))}
          </div>
        </Container>

        <div className="absolute inset-x-[var(--section-px)] bottom-6 z-20 sm:bottom-8">
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

type ProcessReducedMotionProps = ProcessFramesProps;

function ProcessReducedMotion({
  frames,
}: ProcessReducedMotionProps): React.ReactElement {
  const { tier } = useHydrationSafeBreakpoint();
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
    const frame = requestAnimationFrame(() => {
      updateActiveIndex();
    });
    const onScroll = (): void => {
      updateActiveIndex();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateActiveIndex]);

  const progress = frames.length > 1 ? activeIndex / (frames.length - 1) : 0;

  return (
    <div className="relative">
      <Container className="flex flex-col gap-4 pb-8 pt-[var(--section-py)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            02 / The Process / Post-Production
          </span>
          <span className="shrink-0 text-eyebrow text-[color:var(--color-muted)]">
            Stage {formatIndex(activeIndex + 1, 2)} /{" "}
            {formatIndex(frames.length, 2)}
          </span>
        </div>
        <PhaseRail frames={frames} activeIndex={activeIndex} />
      </Container>

      <div className="sticky top-[var(--nav-offset)] z-10 px-[var(--section-px)]">
        <MediaFrame
          aspectRatio="4/3"
          className="border border-[color:var(--color-divider)] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        >
          {frames.map((frame, i) => (
            <motion.div
              key={`reduced-visual-${frame.index}`}
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
          <ReducedMotionProcessStep
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

interface ReducedMotionProcessStepProps {
  frame: ProcessFrame;
  index: number;
  total: number;
  isActive: boolean;
}

const ReducedMotionProcessStep = forwardRef<
  HTMLElement,
  ReducedMotionProcessStepProps
>(function ReducedMotionProcessStep(
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
            : "text-[color:var(--color-dim)] opacity-100",
        )}
      >
        {frame.copy}
      </p>
      <p className="font-mono text-xs text-[color:var(--color-dim)]">
        Stage {formatIndex(index + 1, 2)} / {formatIndex(total, 2)}
      </p>
    </article>
  );
});

interface FrameImageProps {
  frame: ProcessFrame;
  posterWidth: number;
  priority?: boolean;
}

function FrameImage({
  frame,
  posterWidth,
  priority = false,
}: FrameImageProps): React.ReactElement {
  const [imageError, setImageError] = useState(false);
  const imageSrc =
    frame.media.type === "image"
      ? frame.media.src
      : posterUrl(frame.media.playbackId, {
          time: frame.media.posterTime,
          width: posterWidth,
        });
  const sizes = frame.media.type === "image" ? "100vw" : MUX_IMAGE_SIZES;

  return (
    <>
      {!imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover object-center"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          sizes={sizes}
          style={{ filter: frame.filter }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="h-full w-full bg-[color:var(--color-elevated)]" />
      )}
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
