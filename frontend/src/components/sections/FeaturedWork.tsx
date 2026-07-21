"use client";

import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useProjectDeepLink } from "@/hooks/useProjectDeepLink";
import { featuredProjects, type Project } from "@/data/projects";

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

  const { openProject, closeProject } = useProjectDeepLink({
    activeProject,
    onOpen: handleOpen,
    onClose: handleClose,
  });

  return (
    <Section id="work" labelledBy="work-heading" borderTop>
      <Container>
        <SectionHeader
          label="03 / Selected Work"
          aside={`${featuredProjects.length} films`}
        />

        <h2
          id="work-heading"
          className="font-display mt-10 text-headline max-w-3xl sm:mt-12"
        >
          Selected films from the wedding archive.
        </h2>

        <div className="mt-8 divide-y divide-[color:var(--color-divider)]">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={openProject}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center sm:mt-16">
          <Link
            href="/films"
            className="group inline-flex items-center gap-2 border-b border-[color:var(--color-divider)] pb-3 text-eyebrow text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-foreground)] hover:text-[color:var(--color-foreground)]"
          >
            <span>View All Films</span>
            <ArrowUpRight
              size={14}
              strokeWidth={1.5}
              className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <ProjectModal project={activeProject} onClose={closeProject} />
      </Container>
    </Section>
  );
}
