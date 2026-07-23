"use client";

import { motion } from "motion/react";
import { useCallback, useRef } from "react";

import { useCursor } from "@/components/experience/CursorContext";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import type { Project } from "@/data/projects";
import { posterWidthForTier } from "@/lib/breakpoints";
import { useHydrationSafeBreakpoint } from "@/hooks/useHydrationSafeBreakpoint";
import { isRealPlaybackId, posterUrl } from "@/lib/mux";
import { EASE } from "@/lib/constants";

interface FilmsMomentProps {
  project: Project;
  onOpen: (project: Project) => void;
}

export function FilmsMoment({
  project,
  onOpen,
}: FilmsMomentProps): React.ReactElement {
  const { tier } = useHydrationSafeBreakpoint();
  const revealMotion = useRevealMotion();
  const { setState, reset } = useCursor();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hasPlayback = isRealPlaybackId(project.video.playbackId);
  const posterSrc = hasPlayback
    ? posterUrl(project.video.playbackId, {
        time: project.video.posterTime,
        width: posterWidthForTier(tier),
      })
    : undefined;

  const handleClick = useCallback((): void => {
    onOpen(project);
  }, [project, onOpen]);

  const handleMouseEnter = useCallback((): void => {
    if (hasPlayback) setState({ kind: "play" });
  }, [hasPlayback, setState]);

  const handleMouseLeave = useCallback((): void => {
    reset();
  }, [reset]);

  return (
    <motion.section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      variants={revealMotion.variants}
      initial={revealMotion.initial}
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      aria-label={`Featured: ${project.title}`}
    >
      <button
        type="button"
        className="group relative block w-full cursor-pointer overflow-hidden outline-offset-4"
        style={{ aspectRatio: "21/9" }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`Watch ${project.title}`}
        data-cursor="play"
      >
        {posterSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-cinematic)] group-hover:scale-[1.03]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-[color:var(--color-elevated)]" />
        )}

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 sm:p-10 lg:p-14">
          <motion.span
            className="text-eyebrow text-[color:var(--color-foreground)]/70"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE.expoOut, delay: 0.2 }}
          >
            {project.category} / {project.year}
          </motion.span>
          <motion.h2
            className="font-display text-headline max-w-xl text-[color:var(--color-foreground)]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE.expoOut, delay: 0.3 }}
          >
            {project.title}
          </motion.h2>
          <motion.p
            className="line-clamp-2 max-w-xl text-body text-[color:var(--color-foreground)]/70"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE.expoOut, delay: 0.4 }}
          >
            {project.description}
          </motion.p>
          <motion.span
            className="mt-1 font-mono text-xs text-[color:var(--color-foreground)]/60"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {project.location} — {project.video.duration}
          </motion.span>
        </div>
      </button>
    </motion.section>
  );
}
