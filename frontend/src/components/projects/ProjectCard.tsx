"use client";

import { motion } from "motion/react";

import type { Project } from "@/data/projects";
import { EASE } from "@/lib/constants";
import { formatIndex } from "@/lib/utils";

import { VideoPreview } from "./VideoPreview";

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
}

export function ProjectCard({
  project,
  onOpen,
}: ProjectCardProps): React.ReactElement {
  return (
    <motion.article
      className="grid grid-cols-1 gap-8 py-16 sm:py-24 md:grid-cols-12 md:gap-10"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 1, ease: EASE.expoOut }}
    >
      <div className="md:col-span-5 md:sticky md:top-24 md:self-start">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-xs text-[color:var(--color-dim)]">
            {formatIndex(project.index)}
          </span>
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            {project.category} / {project.year}
          </span>
        </div>
        <h3 className="font-display mt-4 text-headline">{project.title}</h3>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--color-muted)]">
          {project.description}
        </p>
        <dl className="mt-8 flex flex-col gap-2 text-xs font-mono text-[color:var(--color-muted)]">
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

      <div className="md:col-span-7">
        <VideoPreview
          src={project.video.src}
          poster={project.video.poster}
          duration={project.video.duration}
          ariaLabel={project.title}
          onOpen={() => onOpen(project)}
        />
      </div>
    </motion.article>
  );
}
