import { projects, type Project } from "@/data/projects";

export function getProjectById(id: string): Project | null {
  if (!id || typeof id !== "string") return null;
  const project = projects.find((entry) => entry.id === id);
  return project ?? null;
}

export function isValidProjectId(id: string): boolean {
  return getProjectById(id) !== null;
}
