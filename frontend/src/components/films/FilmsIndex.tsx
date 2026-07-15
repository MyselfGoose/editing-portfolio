"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useHydrationSafeBreakpoint } from "@/hooks/useHydrationSafeBreakpoint";
import { useMousePosition } from "@/hooks/useMousePosition";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { Project } from "@/data/projects";
import { posterWidthForTier } from "@/lib/breakpoints";
import { EASE } from "@/lib/constants";
import { isRealPlaybackId, posterUrl } from "@/lib/mux";
import { cn } from "@/lib/utils";

import { FilmsIndexRow } from "./FilmsIndexRow";

interface FilmsIndexProps {
  films: ReadonlyArray<Project>;
  onOpen: (project: Project) => void;
}

export function FilmsIndex({
  films,
  onOpen,
}: FilmsIndexProps): React.ReactElement {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useMousePosition();
  const { tier, finePointer, isDesktop } = useHydrationSafeBreakpoint();
  const reducedMotion = usePrefersReducedMotion();

  const canShowPreview = finePointer && isDesktop && !reducedMotion;
  const previewWidth = posterWidthForTier(tier);

  const handleHoverStart = useCallback(
    (project: Project): void => {
      if (!canShowPreview) return;
      if (isRealPlaybackId(project.video.playbackId)) {
        setHoveredProject(project);
      }
    },
    [canShowPreview],
  );

  const handleHoverEnd = useCallback((): void => {
    setHoveredProject(null);
  }, []);

  const previewSrc =
    hoveredProject && isRealPlaybackId(hoveredProject.video.playbackId)
      ? posterUrl(hoveredProject.video.playbackId, {
          time: hoveredProject.video.posterTime,
          width: previewWidth,
        })
      : null;

  return (
    <section
      id="films-index"
      ref={containerRef}
      className="relative w-full px-[var(--section-px)] py-[var(--section-py)]"
      aria-label="Films collection"
    >
      <div className="mx-auto w-full max-w-[var(--container-max)]">
        <AnimatePresence mode="popLayout">
          {films.map((film) => (
            <motion.div
              key={film.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE.smooth }}
            >
              <FilmsIndexRow
                project={film}
                onOpen={onOpen}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {films.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-eyebrow text-[color:var(--color-muted)]">
              No films in this category yet
            </p>
          </div>
        ) : null}
      </div>

      {canShowPreview ? (
        <FloatingPreview src={previewSrc} mouseRef={mouseRef} />
      ) : null}
    </section>
  );
}

interface FloatingPreviewProps {
  src: string | null;
  mouseRef: React.RefObject<{ x: number; y: number } | null>;
}

function FloatingPreview({
  src,
  mouseRef,
}: FloatingPreviewProps): React.ReactElement {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    if (mouseRef.current) {
      currentPos.current = {
        x: mouseRef.current.x,
        y: mouseRef.current.y,
      };
    }

    const tick = (): void => {
      if (!frameRef.current || !mouseRef.current) return;
      const target = mouseRef.current;
      currentPos.current.x += (target.x - currentPos.current.x) * 0.12;
      currentPos.current.y += (target.y - currentPos.current.y) * 0.12;
      frameRef.current.style.transform = `translate3d(${currentPos.current.x + 24}px, ${currentPos.current.y - 120}px, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src, mouseRef]);

  return (
    <AnimatePresence>
      {src ? (
        <motion.div
          ref={frameRef}
          className={cn(
            "pointer-events-none fixed left-0 top-0 z-50 hidden overflow-hidden lg:block",
            "h-[200px] w-[320px] xl:h-[240px] xl:w-[380px]",
          )}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: EASE.smooth }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
            aria-hidden="true"
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
