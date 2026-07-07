"use client";

import { useCallback, useRef, useState } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

import { useCursor } from "../experience/CursorContext";

interface VideoPreviewProps {
  src: string;
  poster: string;
  duration?: string;
  ariaLabel: string;
  onOpen: () => void;
}

export function VideoPreview({
  src,
  poster,
  duration,
  ariaLabel,
  onOpen,
}: VideoPreviewProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [available, setAvailable] = useState<boolean>(true);
  const [playing, setPlaying] = useState<boolean>(false);

  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = usePrefersReducedMotion();
  const canHoverPlay = finePointer && !reducedMotion && available;
  const { setState, reset } = useCursor();

  const handleEnter = useCallback((): void => {
    if (canHoverPlay) {
      const v = videoRef.current;
      if (v) {
        v.play()
          .then(() => setPlaying(true))
          .catch(() => {
            setPlaying(false);
          });
      }
    }
    setState({ kind: "play" });
  }, [canHoverPlay, setState]);

  const handleLeave = useCallback((): void => {
    const v = videoRef.current;
    if (v && canHoverPlay) {
      v.pause();
      v.currentTime = 0;
      setPlaying(false);
    }
    reset();
  }, [canHoverPlay, reset]);

  const handleClick = useCallback((): void => {
    onOpen();
  }, [onOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen();
      }
    },
    [onOpen],
  );

  return (
    <button
      type="button"
      className="group relative aspect-video w-full overflow-hidden bg-[color:var(--color-elevated)] outline-offset-4"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${ariaLabel}`}
      data-cursor="play"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        aria-hidden="true"
        onError={() => setAvailable(false)}
      >
        <source src={src} type="video/mp4" />
      </video>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-xs font-mono text-[color:var(--color-foreground)]/80 sm:p-6">
        <span aria-hidden="true">{playing ? "PLAYING" : "PREVIEW"}</span>
        {duration ? <span aria-hidden="true">{duration}</span> : null}
      </div>
    </button>
  );
}
