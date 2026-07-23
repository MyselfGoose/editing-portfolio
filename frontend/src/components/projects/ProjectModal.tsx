"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import { FilmAdjacentNav } from "@/components/films/FilmAdjacentNav";
import { FilmCredits } from "@/components/films/FilmCredits";
import { FilmPlayer } from "@/components/films/FilmPlayer";
import { FilmShareLink } from "@/components/films/FilmShareLink";
import { useExperience } from "@/components/providers/ExperienceProvider";
import type { Project } from "@/data/projects";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { modalMotion } from "@/lib/motion-presets";
import type { AdjacentFilms } from "@/lib/projects";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onNavigate?: (direction: "prev" | "next") => void;
  adjacentFilms?: AdjacentFilms;
}

export function ProjectModal({
  project,
  onClose,
  onNavigate,
  adjacentFilms,
}: ProjectModalProps): React.ReactElement {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { tier } = useBreakpoint();
  const { setScrollLocked } = useExperience();
  const { overlay, panel } = modalMotion(tier);

  const handleClose = useCallback((): void => {
    onClose();
  }, [onClose]);

  const handlePrev = useCallback((): void => {
    onNavigate?.("prev");
  }, [onNavigate]);

  const handleNext = useCallback((): void => {
    onNavigate?.("next");
  }, [onNavigate]);

  const hasPrev =
    adjacentFilms?.prev !== null && adjacentFilms?.prev !== undefined;
  const hasNext =
    adjacentFilms?.next !== null && adjacentFilms?.next !== undefined;
  const canNavigate = onNavigate !== undefined;

  useEffect(() => {
    if (!project) {
      setScrollLocked(false);
      return;
    }

    setScrollLocked(true);
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }
      if (canNavigate && event.key === "ArrowLeft" && hasPrev) {
        event.preventDefault();
        handlePrev();
        return;
      }
      if (canNavigate && event.key === "ArrowRight" && hasNext) {
        event.preventDefault();
        handleNext();
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], video, mux-player, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      setScrollLocked(false);
      previousFocusRef.current?.focus?.();
    };
  }, [
    project,
    handleClose,
    handlePrev,
    handleNext,
    hasPrev,
    hasNext,
    canNavigate,
    setScrollLocked,
  ]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {project ? (
        <motion.div
          key={project.id}
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlay}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${project.id}`}
        >
          <motion.div
            ref={dialogRef}
            className="relative mx-auto flex h-full max-h-[100svh] w-full max-w-6xl flex-col gap-6 overflow-y-auto overscroll-contain px-[var(--section-px)] py-12 sm:py-16"
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={overlay}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-eyebrow text-[color:var(--color-muted)]">
                  {project.category} / {project.year}
                </span>
                <h2
                  id={`modal-title-${project.id}`}
                  className="font-display text-headline"
                >
                  {project.title}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {canNavigate && adjacentFilms ? (
                  <FilmAdjacentNav
                    adjacent={adjacentFilms}
                    mode="buttons"
                    onNavigate={onNavigate}
                  />
                ) : null}
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={handleClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-divider)] transition-colors hover:bg-[color:var(--color-elevated)]"
                  aria-label="Close project"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <FilmPlayer project={project} />

            <div
              className={
                project.description?.trim()
                  ? "grid grid-cols-1 gap-6 md:grid-cols-3"
                  : "flex flex-col gap-6"
              }
            >
              {project.description?.trim() ? (
                <p className="md:col-span-2 max-w-xl text-body-lg text-[color:var(--color-muted)]">
                  {project.description}
                </p>
              ) : null}
              <div className="flex flex-col gap-4">
                <FilmCredits project={project} />
                <FilmShareLink slug={project.id} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
