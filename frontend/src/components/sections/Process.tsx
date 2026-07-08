"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MUX_DEMO_VIDEO } from "@/lib/constants";
import { MUX_IMAGE_DEFAULTS, posterUrl } from "@/lib/mux";
import { formatIndex } from "@/lib/utils";

interface Frame {
  index: number;
  label: string;
  title: string;
  copy: string;
  posterTime: number;
  filter: string;
}

const FRAMES: ReadonlyArray<Frame> = [
  {
    index: 1,
    label: "FRAME 000",
    title: "Raw footage.",
    copy: "The unedited take. Long. Silent. Full of possibility. We start here so nothing precious gets lost.",
    posterTime: 2,
    filter: "saturate(0) contrast(1.05) brightness(0.9)",
  },
  {
    index: 2,
    label: "FRAME 001",
    title: "Color layers.",
    copy: "Grain, contrast, temperature. Color isn't a filter. It's how the film starts to feel like a memory.",
    posterTime: 10,
    filter: "saturate(0.65) contrast(1.12) brightness(0.95)",
  },
  {
    index: 3,
    label: "FRAME 002",
    title: "The final cut.",
    copy: "Pacing, silence, breath. Every frame earns its place. What you see is what stayed after everything else was cut away.",
    posterTime: 18,
    filter: "saturate(1.1) contrast(1.05) brightness(1)",
  },
];

const PLAYBACK_ID = MUX_DEMO_VIDEO.playbackId;

export function Process(): React.ReactElement {
  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const visualsRef = useRef<Array<HTMLDivElement | null>>([]);
  const textsRef = useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const enableScrub = isDesktop && !reducedMotion;

  useGSAP(
    () => {
      if (!enableScrub) return;
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
          end: () => `+=${window.innerHeight * (FRAMES.length + 0.5)}`,
          scrub: 1,
          pin: track,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 0; i < FRAMES.length - 1; i += 1) {
        const position = i + 1;
        tl.to(visuals[i], { opacity: 0, duration: 1, ease: "power2.inOut" }, position)
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
          { scaleX: 1, ease: "none", duration: FRAMES.length - 1 },
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
          className="relative flex h-[100svh] w-full flex-col overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-8 sm:px-10">
            <span className="text-eyebrow text-[color:var(--color-muted)]">
              The Process / Timeline
            </span>
            <span className="text-eyebrow text-[color:var(--color-muted)]">
              {FRAMES.length} frames
            </span>
          </div>

          <div className="grid flex-1 grid-cols-1 items-center gap-8 px-6 pb-20 pt-20 md:grid-cols-2 md:gap-16 sm:px-10">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-[color:var(--color-divider)] bg-[color:var(--color-elevated)]">
              {FRAMES.map((frame, i) => (
                <div
                  key={`visual-${frame.index}`}
                  ref={(el: HTMLDivElement | null) => {
                    visualsRef.current[i] = el;
                  }}
                  className="absolute inset-0 opacity-0"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterUrl(PLAYBACK_ID, {
                      time: frame.posterTime,
                      width: MUX_IMAGE_DEFAULTS.posterWidth,
                    })}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: frame.filter }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                    <span className="text-eyebrow text-[color:var(--color-muted)]">
                      {frame.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative min-h-[280px] md:min-h-[320px]">
              {FRAMES.map((frame, i) => (
                <div
                  key={`text-${frame.index}`}
                  ref={(el: HTMLDivElement | null) => {
                    textsRef.current[i] = el;
                  }}
                  className="absolute inset-0 flex flex-col justify-center gap-6"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <FrameCopy frame={frame} />
                </div>
              ))}
            </div>
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
            <div key={frame.index} className="flex flex-col gap-8">
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-[color:var(--color-divider)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl(PLAYBACK_ID, {
                    time: frame.posterTime,
                    width: MUX_IMAGE_DEFAULTS.posterWidth,
                  })}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: frame.filter }}
                />
              </div>
              <FrameCopy frame={frame} stacked />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface FrameCopyProps {
  frame: Frame;
  stacked?: boolean;
}

function FrameCopy({ frame, stacked = false }: FrameCopyProps): React.ReactElement {
  return (
    <div className={stacked ? "flex flex-col gap-6" : "flex flex-col gap-6"}>
      <div className="flex flex-col gap-3">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          {frame.label}
        </span>
        <p className="font-mono text-xs text-[color:var(--color-dim)]">
          {formatIndex(frame.index, 2)} / {formatIndex(FRAMES.length, 2)}
        </p>
      </div>
      <h3 className="font-display text-headline">{frame.title}</h3>
      <p className="max-w-md text-base text-[color:var(--color-muted)] leading-relaxed">
        {frame.copy}
      </p>
    </div>
  );
}
