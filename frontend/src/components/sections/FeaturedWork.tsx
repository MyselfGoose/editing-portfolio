"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useProjectDeepLink } from "@/hooks/useProjectDeepLink";
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
          aside={`${projects.length} chapters`}
        />

        <h2
          id="work-heading"
          className="font-display mt-10 text-headline max-w-3xl sm:mt-12"
        >
          Here is our best work that we have done.
        </h2>

        <div className="mt-8 divide-y divide-[color:var(--color-divider)]">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={openProject}
            />
          ))}
        </div>

        <ProjectModal project={activeProject} onClose={closeProject} />
      </Container>
    </Section>
  );
}
