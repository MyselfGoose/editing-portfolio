"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import { useProjectDeepLink } from "@/hooks/useProjectDeepLink";
import { type Project, type ProjectCategory } from "@/data/projects";
import {
  getAllFilms,
  getAdjacentFilms,
  getFilmCategories,
  getFilmsByCategory,
  getFilmYearRange,
} from "@/lib/projects";

import { FilmsClosingCta } from "./FilmsClosingCta";
import { FilmsFilterRail } from "./FilmsFilterRail";
import { FilmsHero } from "./FilmsHero";
import { FilmsIndex } from "./FilmsIndex";
import { FilmsMoment } from "./FilmsMoment";

const ProjectModal = dynamic(
  () =>
    import("@/components/projects/ProjectModal").then((m) => m.ProjectModal),
  { ssr: false },
);

export function FilmsStage(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | null>(
    null,
  );
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const allFilms = useMemo(() => getAllFilms(), []);
  const categories = useMemo(() => getFilmCategories(), []);
  const yearRange = useMemo(() => getFilmYearRange(), []);

  const filteredFilms = useMemo(
    () => getFilmsByCategory(activeCategory),
    [activeCategory],
  );

  const momentFilm = useMemo(() => {
    const target = filteredFilms.length > 3 ? filteredFilms[3] : null;
    return target ?? null;
  }, [filteredFilms]);

  const filmsBeforeMoment = useMemo(() => {
    if (!momentFilm) return filteredFilms;
    const idx = filteredFilms.findIndex((f) => f.id === momentFilm.id);
    return idx > 0 ? filteredFilms.slice(0, idx) : filteredFilms;
  }, [filteredFilms, momentFilm]);

  const filmsAfterMoment = useMemo(() => {
    if (!momentFilm) return [];
    const idx = filteredFilms.findIndex((f) => f.id === momentFilm.id);
    return idx >= 0 ? filteredFilms.slice(idx + 1) : [];
  }, [filteredFilms, momentFilm]);

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

  const handleCategoryChange = useCallback(
    (category: ProjectCategory | null): void => {
      setActiveCategory(category);
    },
    [],
  );

  const handleNavigateFilm = useCallback(
    (direction: "prev" | "next"): void => {
      if (!activeProject) return;
      const { prev, next } = getAdjacentFilms(
        activeProject.id,
        filteredFilms,
      );
      const target = direction === "prev" ? prev : next;
      if (target) {
        openProject(target);
      }
    },
    [activeProject, filteredFilms, openProject],
  );

  return (
    <>
      <FilmsHero filmCount={allFilms.length} yearRange={yearRange} />

      <FilmsFilterRail
        categories={categories}
        totalCount={allFilms.length}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <FilmsIndex films={filmsBeforeMoment} onOpen={openProject} />

      {momentFilm ? (
        <FilmsMoment project={momentFilm} onOpen={openProject} />
      ) : null}

      {filmsAfterMoment.length > 0 ? (
        <FilmsIndex films={filmsAfterMoment} onOpen={openProject} />
      ) : null}

      <FilmsClosingCta />

      <ProjectModal
        project={activeProject}
        onClose={closeProject}
        onNavigate={handleNavigateFilm}
        adjacentFilms={
          activeProject
            ? getAdjacentFilms(activeProject.id, filteredFilms)
            : undefined
        }
      />
    </>
  );
}
