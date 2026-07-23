"use client";

import MuxPlayer from "@mux/mux-player-react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useExperience } from "@/components/providers/ExperienceProvider";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { posterWidthForTier } from "@/lib/breakpoints";
import { BRAND, SHOWREEL } from "@/lib/constants";
import { modalMotion } from "@/lib/motion-presets";
import { MUX_PLAYER_PRESETS, posterUrl } from "@/lib/mux";
import { pauseMuxPlayer, playMuxPlayer } from "@/lib/video-lifecycle";

interface ShowreelOverlayProps {
  open: boolean;
  onClose: () => void;
  onOpenChangeAmbient?: (paused: boolean) => void;
}

function ShowreelDialog({
  onClose,
  onOpenChangeAmbient,
}: {
  onClose: () => void;
  onOpenChangeAmbient?: (paused: boolean) => void;
}): React.ReactElement {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { tier, isDesktop } = useBreakpoint();
  const isPageVisible = usePageVisibility();
  const reducedMotion = usePrefersReducedMotion();
  const { setScrollLocked } = useExperience();
  const { overlay, panel } = modalMotion(tier);
  const [failed, setFailed] = useState(false);
  const [userStarted, setUserStarted] = useState(false);

  const playerPreset = isDesktop
    ? MUX_PLAYER_PRESETS.cinematic
    : MUX_PLAYER_PRESETS.cinematicMobile;

  const poster = posterUrl(SHOWREEL.playbackId, {
    time: SHOWREEL.posterTime,
    width: posterWidthForTier(tier),
  });

  const preferPosterFirst = reducedMotion;
  const shouldAutoPlay = !preferPosterFirst || userStarted;

  const handleClose = useCallback((): void => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    setScrollLocked(true);
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    document.body.style.overflow = "hidden";
    onOpenChangeAmbient?.(true);

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
    const dialog = dialogRef.current;
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      setScrollLocked(false);
      onOpenChangeAmbient?.(false);
      const player = dialog?.querySelector("mux-player");
      if (player) {
        pauseMuxPlayer(player as HTMLElement);
      }
      const previous = previousFocusRef.current;
      if (previous?.isConnected) {
        previous.focus?.();
      }
    };
  }, [handleClose, setScrollLocked, onOpenChangeAmbient]);

  useEffect(() => {
    if (!dialogRef.current || failed) return;

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
        if (!isPageVisible || !shouldAutoPlay) {
          pauseMuxPlayer(player as HTMLElement);
        } else {
          playMuxPlayer(player as HTMLElement);
        }
      } catch {
        /* not ready */
      }
    };

    syncPlayback();
    return () => {
      cancelled = true;
    };
  }, [isPageVisible, shouldAutoPlay, failed]);

  return (
    <motion.div
      key="showreel"
      className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="showreel-title"
    >
      <motion.div
        ref={dialogRef}
        className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-6 px-[var(--section-px)] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(5rem,calc(env(safe-area-inset-top)+3.5rem))]"
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
              {BRAND.name}
            </span>
            <h2 id="showreel-title" className="font-display text-headline">
              {SHOWREEL.title}
            </h2>
            <p className="font-mono text-xs text-[color:var(--color-dim)]">
              {SHOWREEL.duration}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-divider)] transition-colors hover:bg-[color:var(--color-elevated)]"
            aria-label="Close film"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div
          className="relative w-full overflow-hidden bg-black"
          style={{ aspectRatio: "16/9" }}
        >
          {preferPosterFirst && !userStarted ? (
            <button
              type="button"
              className="group relative flex h-full min-h-[240px] w-full items-center justify-center"
              onClick={() => setUserStarted(true)}
              aria-label={`Press play to watch ${SHOWREEL.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- reduced-motion poster gate */}
              <img
                src={poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="relative border border-[color:var(--color-foreground)] bg-black/50 px-6 py-3 text-eyebrow backdrop-blur-sm">
                Press play to watch
              </span>
            </button>
          ) : !failed ? (
            <MuxPlayer
              playbackId={SHOWREEL.playbackId}
              streamType={playerPreset.streamType}
              maxResolution={playerPreset.maxResolution}
              capRenditionToPlayerSize={playerPreset.capRenditionToPlayerSize}
              poster={poster}
              muted
              playsInline
              accentColor="#f5f5f5"
              primaryColor="#f5f5f5"
              secondaryColor="#0a0a0a"
              preload="metadata"
              metadata={{
                video_id: "showreel",
                video_title: SHOWREEL.title,
                video_series: BRAND.name,
              }}
              style={{
                aspectRatio: "16/9",
                height: "auto",
                width: "100%",
              }}
              aria-label={`${SHOWREEL.title} — full video`}
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="relative flex h-full min-h-[240px] flex-col items-center justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
              <p className="relative text-eyebrow text-[color:var(--color-muted)]">
                Playback unavailable
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ShowreelOverlay({
  open,
  onClose,
  onOpenChangeAmbient,
}: ShowreelOverlayProps): React.ReactElement {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <ShowreelDialog
          onClose={onClose}
          onOpenChangeAmbient={onOpenChangeAmbient}
        />
      ) : null}
    </AnimatePresence>
  );
}
