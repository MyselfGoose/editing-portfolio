"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
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
    <Section id="work" labelledBy="work-heading" borderTop>
      <Container>
        <SectionHeader
          label="02 / Selected Work"
          aside={`${projects.length} chapters`}
        />

        <h2
          id="work-heading"
          className="font-display mt-10 text-headline max-w-3xl sm:mt-12"
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
      </Container>
    </Section>
  );
}
