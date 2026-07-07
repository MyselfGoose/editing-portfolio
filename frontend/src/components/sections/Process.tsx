"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { formatIndex } from "@/lib/utils";

interface Frame {
  index: number;
  label: string;
  title: string;
  copy: string;
}

const FRAMES: ReadonlyArray<Frame> = [
  {
    index: 1,
    label: "FRAME 000",
    title: "Raw footage.",
    copy: "The unedited take. Long. Silent. Full of possibility. We start here so nothing precious gets lost.",
  },
  {
    index: 2,
    label: "FRAME 001",
    title: "Color layers.",
    copy: "Grain, contrast, temperature. Color isn't a filter. It's how the film starts to feel like a memory.",
  },
  {
    index: 3,
    label: "FRAME 002",
    title: "The final cut.",
    copy: "Pacing, silence, breath. Every frame earns its place. What you see is what stayed after everything else was cut away.",
  },
];

export function Process(): React.ReactElement {
  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const framesRef = useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const enableScrub = isDesktop && !reducedMotion;

  useGSAP(
    () => {
      if (!enableScrub) return;
      const root = rootRef.current;
      const track = trackRef.current;
      const frames = framesRef.current.filter(
        (f): f is HTMLDivElement => f !== null,
      );
      const progressBar = progressRef.current;
      if (!root || !track || frames.length === 0) return;

      gsap.set(frames, {
        clipPath: (i: number) =>
          i === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
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
        },
      });

      frames.slice(1).forEach((frame, i) => {
        tl.to(
          frame,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "power2.inOut",
            duration: 1,
          },
          i,
        );
      });

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
    { dependencies: [enableScrub], scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="process"
      className="relative w-full bg-[color:var(--color-background)]"
      aria-labelledby="process-heading"
    >
      <h2 id="process-heading" className="sr-only">
        Our process
      </h2>

      {enableScrub ? (
        <div
          ref={trackRef}
          className="relative h-[100svh] w-full overflow-hidden"
        >
          <div className="absolute inset-0">
            {FRAMES.map((frame, i) => (
              <div
                key={frame.index}
                ref={(el: HTMLDivElement | null) => {
                  framesRef.current[i] = el;
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <FramePanel frame={frame} />
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-8 sm:px-10">
            <span className="text-eyebrow text-[color:var(--color-muted)]">
              The Process / Timeline
            </span>
            <span className="text-eyebrow text-[color:var(--color-muted)]">
              {FRAMES.length} frames
            </span>
          </div>

          <div className="absolute inset-x-6 bottom-8 z-20 sm:inset-x-10">
            <div className="h-px w-full bg-[color:var(--color-divider)]">
              <div
                ref={progressRef}
                className="h-px w-full bg-[color:var(--color-foreground)]"
                style={{ transformOrigin: "left center" }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-24 px-6 py-24 sm:px-10 sm:py-32">
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            The Process / Timeline
          </span>
          {FRAMES.map((frame) => (
            <FramePanel key={frame.index} frame={frame} stacked />
          ))}
        </div>
      )}
    </section>
  );
}

interface FramePanelProps {
  frame: Frame;
  stacked?: boolean;
}

function FramePanel({ frame, stacked = false }: FramePanelProps): React.ReactElement {
  return (
    <div
      className={
        stacked
          ? "flex flex-col gap-6"
          : "grid h-full w-full grid-cols-1 items-center gap-8 px-6 sm:px-10 md:grid-cols-2 md:gap-16"
      }
    >
      <div className="flex flex-col gap-3">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          {frame.label}
        </span>
        <p className="font-mono text-xs text-[color:var(--color-dim)]">
          {formatIndex(frame.index, 2)} / {formatIndex(FRAMES.length, 2)}
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <h3 className="font-display text-headline">{frame.title}</h3>
        <p className="max-w-md text-base text-[color:var(--color-muted)] leading-relaxed">
          {frame.copy}
        </p>
      </div>
    </div>
  );
}
