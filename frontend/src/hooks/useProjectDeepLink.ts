import { useCallback } from "react";

import type { Project } from "@/data/projects";

interface UseProjectDeepLinkOptions {
  activeProject: Project | null;
  onOpen: (project: Project) => void;
  onClose: () => void;
}

/**
 * Modal open/close helpers for Featured Work and Films archive.
 * Shareable film URLs are `/films/[slug]` (FilmShareLink + server `?project=` redirects).
 * This hook intentionally does not mutate history with `?project=`.
 */
export function useProjectDeepLink({
  onOpen,
  onClose,
}: UseProjectDeepLinkOptions): {
  openProject: (project: Project) => void;
  closeProject: () => void;
} {
  const openProject = useCallback(
    (project: Project): void => {
      onOpen(project);
    },
    [onOpen],
  );

  const closeProject = useCallback((): void => {
    onClose();
  }, [onClose]);

  return { openProject, closeProject };
}
