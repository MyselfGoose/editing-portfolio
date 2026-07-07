"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects, type Project } from "@/data/projects";

const ProjectModal = dynamic(
  () => import("@/components/projects/ProjectModal").then((m) => m.ProjectModal),
  { ssr: false },
);

export function FeaturedWork(): React.ReactElement {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleOpen = useCallback((project: Project): void => {
    setActiveProject(project);
  }, []);

  const handleClose = useCallback((): void => {
    setActiveProject(null);
  }, []);

  return (
    <section
      id="work"
      className="relative w-full border-t border-[color:var(--color-divider)] px-6 py-24 sm:px-10 sm:py-32"
      aria-labelledby="work-heading"
    >
      <header className="flex items-baseline justify-between">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          02 / Selected Work
        </span>
        <span className="text-eyebrow text-[color:var(--color-muted)] hidden sm:inline">
          {projects.length} chapters
        </span>
      </header>

      <h2
        id="work-heading"
        className="font-display mt-12 text-headline max-w-3xl"
      >
        Each project is a chapter.
      </h2>

      <div className="mt-8 divide-y divide-[color:var(--color-divider)]">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpen={handleOpen}
          />
        ))}
      </div>

      <ProjectModal project={activeProject} onClose={handleClose} />
    </section>
  );
}
