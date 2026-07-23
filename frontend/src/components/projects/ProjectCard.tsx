"use client";

import { motion } from "motion/react";
import { useCallback } from "react";

import { useRevealMotion } from "@/hooks/useRevealMotion";
import type { Project } from "@/data/projects";
import { formatIndex } from "@/lib/utils";

import { VideoPreview } from "./VideoPreview";

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
}

function prefetchProjectModal(): void {
  void import("@/components/projects/ProjectModal").catch(() => {
    /* Prefetch may resolve after Vitest tears down a fast test. */
  });
}

export function ProjectCard({
  project,
  onOpen,
}: ProjectCardProps): React.ReactElement {
  const revealMotion = useRevealMotion();

  const handlePrefetch = useCallback((): void => {
    prefetchProjectModal();
  }, []);

  return (
    <motion.article
      className="grid grid-cols-1 gap-8 py-12 sm:py-20 md:grid-cols-12 md:gap-10 md:py-24"
      variants={revealMotion.variants}
      initial={revealMotion.initial}
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <div className="order-2 md:order-1 md:col-span-5 md:sticky md:top-24 md:self-start">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono text-xs text-[color:var(--color-dim)]">
            {formatIndex(project.index)}
          </span>
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            {project.category} / {project.year}
          </span>
        </div>
        <h3 className="font-display mt-4 text-title">{project.title}</h3>
        {project.description?.trim() ? (
          <p className="mt-4 max-w-md text-body-lg text-[color:var(--color-muted)] sm:mt-6">
            {project.description}
          </p>
        ) : null}
        <dl className="mt-6 flex flex-col gap-2 text-xs font-mono text-[color:var(--color-muted)] sm:mt-8">
          <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
            <dt>Location</dt>
            <dd className="text-[color:var(--color-foreground)]">
              {project.location}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
            <dt>Duration</dt>
            <dd className="text-[color:var(--color-foreground)]">
              {project.video.duration}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
            <dt>Role</dt>
            <dd className="text-[color:var(--color-foreground)]">
              {project.credits.role}
            </dd>
          </div>
        </dl>
      </div>

      <div className="order-1 md:order-2 md:col-span-7">
        <VideoPreview
          playbackId={project.video.playbackId}
          aspectRatio={project.video.aspectRatio}
          duration={project.video.duration}
          posterTime={project.video.posterTime}
          previewRange={project.video.previewRange}
          ariaLabel={project.title}
          onOpen={() => onOpen(project)}
        />
      </div>
    </motion.article>
  );
}
