"use client";

import { motion } from "motion/react";
import { useCallback, useRef } from "react";

import { useCursor } from "@/components/experience/CursorContext";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import type { Project } from "@/data/projects";
import { formatIndex } from "@/lib/utils";

interface FilmsIndexRowProps {
  project: Project;
  onOpen: (project: Project) => void;
  onHoverStart: (project: Project, rect: DOMRect) => void;
  onHoverEnd: () => void;
}

export function FilmsIndexRow({
  project,
  onOpen,
  onHoverStart,
  onHoverEnd,
}: FilmsIndexRowProps): React.ReactElement {
  const revealMotion = useRevealMotion();
  const { setState, reset } = useCursor();
  const rowRef = useRef<HTMLElement | null>(null);

  const handleMouseEnter = useCallback((): void => {
    setState({ kind: "play" });
    if (rowRef.current) {
      onHoverStart(project, rowRef.current.getBoundingClientRect());
    }
  }, [project, onHoverStart, setState]);

  const handleMouseLeave = useCallback((): void => {
    reset();
    onHoverEnd();
  }, [onHoverEnd, reset]);

  const handleClick = useCallback((): void => {
    onOpen(project);
  }, [project, onOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent): void => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen(project);
      }
    },
    [project, onOpen],
  );

  return (
    <motion.article
      ref={rowRef}
      className="group relative cursor-pointer border-b border-[color:var(--color-divider)] outline-offset-4"
      variants={revealMotion.variants}
      initial={revealMotion.initial}
      whileInView="visible"
      viewport={{ once: true, margin: "-8% 0px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} — ${project.category}, ${project.year}`}
      data-cursor="play"
    >
      <div className="flex items-baseline gap-4 py-6 transition-transform duration-500 ease-[var(--ease-expo-out)] sm:gap-6 sm:py-8 md:gap-8 md:py-10 lg:group-hover:translate-x-3">
        <span className="shrink-0 font-mono text-xs text-[color:var(--color-dim)] transition-all duration-500 lg:group-hover:scale-110 lg:group-hover:text-[color:var(--color-muted)]">
          {formatIndex(project.index)}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4 md:gap-6">
          <h3 className="font-display text-title min-w-0 shrink-0 truncate transition-colors duration-300 lg:group-hover:text-[color:var(--color-foreground)]">
            {project.title}
          </h3>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-meta text-[color:var(--color-muted)] sm:ml-auto sm:shrink-0">
            <span>{project.category}</span>
            <span aria-hidden="true" className="text-[color:var(--color-dim)]">
              /
            </span>
            <span>{project.year}</span>
          </div>
        </div>

        <span className="hidden shrink-0 font-mono text-xs text-[color:var(--color-dim)] tabular-nums md:inline">
          {project.video.duration}
        </span>
      </div>
    </motion.article>
  );
}
