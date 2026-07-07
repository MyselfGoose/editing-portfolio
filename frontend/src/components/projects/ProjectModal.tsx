"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import { modalTransition } from "@/lib/animations";
import type { Project } from "@/data/projects";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({
  project,
  onClose,
}: ProjectModalProps): React.ReactElement {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback((): void => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!project) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], video, [tabindex]:not([tabindex="-1"])',
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
      previousFocusRef.current?.focus?.();
    };
  }, [project, handleClose]);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          key={project.id}
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={modalTransition}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${project.id}`}
        >
          <motion.div
            ref={dialogRef}
            className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-6 px-6 py-16 sm:px-10"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={modalTransition}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6">
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

            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <video
                className="h-full w-full object-cover"
                src={project.video.src}
                poster={project.video.poster}
                controls
                controlsList="nodownload"
                preload="metadata"
                playsInline
                aria-label={`${project.title} — full video`}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <p className="md:col-span-2 max-w-xl text-base leading-relaxed text-[color:var(--color-muted)]">
                {project.description}
              </p>
              <dl className="flex flex-col gap-2 text-xs font-mono text-[color:var(--color-muted)]">
                <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
                  <dt>Role</dt>
                  <dd className="text-[color:var(--color-foreground)]">
                    {project.credits.role}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
                  <dt>Client</dt>
                  <dd className="text-[color:var(--color-foreground)]">
                    {project.credits.client}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
                  <dt>Location</dt>
                  <dd className="text-[color:var(--color-foreground)]">
                    {project.location}
                  </dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
