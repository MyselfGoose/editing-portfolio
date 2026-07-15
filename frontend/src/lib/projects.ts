import {
  projects,
  type Project,
  type ProjectCategory,
} from "@/data/projects";

export function getProjectById(id: string): Project | null {
  if (!id || typeof id !== "string") return null;
  const project = projects.find((entry) => entry.id === id);
  return project ?? null;
}

export function isValidProjectId(id: string): boolean {
  return getProjectById(id) !== null;
}

export function getAllFilms(): ReadonlyArray<Project> {
  return projects;
}

export interface CategoryCount {
  readonly category: ProjectCategory;
  readonly count: number;
}

export function getFilmCategories(): ReadonlyArray<CategoryCount> {
  const counts = new Map<ProjectCategory, number>();
  for (const project of projects) {
    counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([category, count]) => ({
    category,
    count,
  }));
}

export function getFilmsByCategory(
  category: ProjectCategory | null,
): ReadonlyArray<Project> {
  if (category === null) return projects;
  return projects.filter((p) => p.category === category);
}

export function getFilmYearRange(): { earliest: number; latest: number } {
  let earliest = Infinity;
  let latest = -Infinity;
  for (const project of projects) {
    if (project.year < earliest) earliest = project.year;
    if (project.year > latest) latest = project.year;
  }
  return { earliest, latest };
}

export interface AdjacentFilms {
  readonly prev: Project | null;
  readonly next: Project | null;
}

export function getAdjacentFilms(
  id: string,
  filmList?: ReadonlyArray<Project>,
): AdjacentFilms {
  const list = filmList ?? projects;
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}
