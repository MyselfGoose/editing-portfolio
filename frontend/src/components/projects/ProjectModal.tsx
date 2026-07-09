"use client";

import MuxPlayer from "@mux/mux-player-react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useExperience } from "@/components/providers/ExperienceProvider";
import type { Project } from "@/data/projects";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { posterWidthForTier } from "@/lib/breakpoints";
import { modalMotion } from "@/lib/motion-presets";
import {
  isRealPlaybackId,
  MUX_PLAYER_PRESETS,
  posterUrl,
} from "@/lib/mux";
import { pauseMuxPlayer, playMuxPlayer } from "@/lib/video-lifecycle";

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
  const { tier, isDesktop } = useBreakpoint();
  const isPageVisible = usePageVisibility();
  const { setScrollLocked } = useExperience();
  const { overlay, panel } = modalMotion(tier);
  const [failedProjectId, setFailedProjectId] = useState<string | null>(null);

  const playerPreset = isDesktop
    ? MUX_PLAYER_PRESETS.cinematic
    : MUX_PLAYER_PRESETS.cinematicMobile;

  const handleClose = useCallback((): void => {
    onClose();
  }, [onClose]);

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
  }, [project, handleClose, setScrollLocked]);

  useEffect(() => {
    if (!project || !dialogRef.current) return;

    let cancelled = false;
    let attempts = 0;

    const syncPlayback = (): void => {
      if (cancelled || !dialogRef.current) return;

      const player = dialogRef.current.querySelector("mux-player");
      if (!player) {
        if (attempts < 24) {
          attempts += 1;
          requestAnimationFrame(syncPlayback);
        }
        return;
      }

      try {
        if (!isPageVisible) {
          pauseMuxPlayer(player as HTMLElement);
        } else {
          playMuxPlayer(player as HTMLElement);
        }
      } catch {
        /* Mux player may not be fully initialized yet */
      }
    };

    syncPlayback();

    return () => {
      cancelled = true;
    };
  }, [isPageVisible, project]);

  const hasPlayback =
    project !== null && isRealPlaybackId(project.video.playbackId);
  const playbackError =
    project !== null && failedProjectId === project.id;

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
            className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-6 px-[var(--section-px)] py-16"
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={overlay}
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-divider)] transition-colors hover:bg-[color:var(--color-elevated)]"
                aria-label="Close project"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div
              className="relative w-full overflow-hidden bg-black"
              style={{ aspectRatio: project.video.aspectRatio }}
            >
              {hasPlayback && !playbackError ? (
                <MuxPlayer
                  playbackId={project.video.playbackId}
                  streamType={playerPreset.streamType}
                  maxResolution={playerPreset.maxResolution}
                  capRenditionToPlayerSize={
                    playerPreset.capRenditionToPlayerSize
                  }
                  poster={posterUrl(project.video.playbackId, {
                    time: project.video.posterTime,
                    width: posterWidthForTier(tier),
                  })}
                  accentColor="#f5f5f5"
                  primaryColor="#f5f5f5"
                  secondaryColor="#0a0a0a"
                  preload="metadata"
                  metadata={{
                    video_id: project.id,
                    video_title: project.title,
                    video_series: project.category,
                  }}
                  style={{
                    aspectRatio: project.video.aspectRatio,
                    height: "auto",
                    width: "100%",
                  }}
                  aria-label={`${project.title} — full video`}
                  onError={() => setFailedProjectId(project.id)}
                >
                  {project.video.captions?.map((track) => (
                    <track
                      key={track.srcLang}
                      kind="subtitles"
                      src={track.src}
                      srcLang={track.srcLang}
                      label={track.label}
                      default={track.default}
                    />
                  ))}
                </MuxPlayer>
              ) : hasPlayback && playbackError ? (
                <div className="relative flex h-full min-h-[240px] flex-col items-center justify-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterUrl(project.video.playbackId, {
                      time: project.video.posterTime,
                      width: posterWidthForTier(tier),
                    })}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                  />
                  <p className="relative text-eyebrow text-[color:var(--color-muted)]">
                    Playback unavailable
                  </p>
                </div>
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center">
                  <p className="text-eyebrow text-[color:var(--color-muted)]">
                    Video coming soon
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <p className="md:col-span-2 max-w-xl text-body-lg text-[color:var(--color-muted)]">
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
