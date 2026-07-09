"use client";

import { useCallback, useEffect, useRef } from "react";

import type { Project } from "@/data/projects";
import { getProjectById } from "@/lib/projects";

interface UseProjectDeepLinkOptions {
  activeProject: Project | null;
  onOpen: (project: Project) => void;
  onClose: () => void;
}

function readProjectIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("project");
  return id && id.length > 0 ? id : null;
}

function buildProjectUrl(projectId: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set("project", projectId);
  return `${url.pathname}${url.search}`;
}

function clearProjectUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("project");
  const next = url.search ? `${url.pathname}${url.search}` : url.pathname;
  window.history.replaceState(null, "", next);
}

export function useProjectDeepLink({
  activeProject,
  onOpen,
  onClose,
}: UseProjectDeepLinkOptions): {
  openProject: (project: Project) => void;
  closeProject: () => void;
} {
  const handledInitialRef = useRef<boolean>(false);

  const openProject = useCallback(
    (project: Project): void => {
      onOpen(project);
      window.history.pushState(
        { projectId: project.id },
        "",
        buildProjectUrl(project.id),
      );
    },
    [onOpen],
  );

  const closeProject = useCallback((): void => {
    onClose();
    clearProjectUrl();
  }, [onClose]);

  useEffect(() => {
    if (handledInitialRef.current) return;
    handledInitialRef.current = true;

    const id = readProjectIdFromUrl();
    if (!id) return;

    const project = getProjectById(id);
    if (project) {
      onOpen(project);
    }
  }, [onOpen]);

  useEffect(() => {
    const handlePopState = (): void => {
      const id = readProjectIdFromUrl();
      if (!id) {
        if (activeProject) onClose();
        return;
      }
      const project = getProjectById(id);
      if (project) {
        onOpen(project);
      } else if (activeProject) {
        onClose();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeProject, onClose, onOpen]);

  return { openProject, closeProject };
}
