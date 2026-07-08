"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MUX_IMAGE_SIZES, previewWidthForTier, posterWidthForTier } from "@/lib/breakpoints";
import type { VideoAspectRatio } from "@/lib/mux";
import {
  animatedPreviewUrl,
  isRealPlaybackId,
  posterUrl,
} from "@/lib/mux";
import { cn } from "@/lib/utils";

import { useCursor } from "../experience/CursorContext";

interface VideoPreviewProps {
  playbackId: string;
  aspectRatio: VideoAspectRatio;
  duration?: string;
  posterTime?: number;
  previewRange?: { start: number; end: number };
  ariaLabel: string;
  onOpen: () => void;
}

export function VideoPreview({
  playbackId,
  aspectRatio,
  duration,
  posterTime,
  previewRange,
  ariaLabel,
  onOpen,
}: VideoPreviewProps): React.ReactElement {
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const [hovered, setHovered] = useState<boolean>(false);
  const [previewLoaded, setPreviewLoaded] = useState<boolean>(false);
  const [shouldLoadPreview, setShouldLoadPreview] = useState<boolean>(false);

  const { tier, finePointer, isDesktop } = useBreakpoint();
  const reducedMotion = usePrefersReducedMotion();
  const isPageVisible = usePageVisibility();
  const showAnimatedPreview = hovered && isPageVisible;
  const hasPlayback = isRealPlaybackId(playbackId);
  const canAnimate =
    hasPlayback &&
    finePointer &&
    isDesktop &&
    !reducedMotion &&
    shouldLoadPreview;
  const { setState, reset } = useCursor();

  const posterWidth = posterWidthForTier(tier);
  const previewWidth = previewWidthForTier(tier);

  useEffect(() => {
    if (!hasPlayback || reducedMotion) return;
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldLoadPreview(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasPlayback, reducedMotion]);

  const handleEnter = useCallback((): void => {
    setHovered(true);
    if (hasPlayback) {
      setState({ kind: "play" });
    }
  }, [hasPlayback, setState]);

  const handleLeave = useCallback((): void => {
    setHovered(false);
    reset();
  }, [reset]);

  const handleClick = useCallback((): void => {
    if (!hasPlayback) return;
    onOpen();
  }, [hasPlayback, onOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      if (!hasPlayback) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen();
      }
    },
    [hasPlayback, onOpen],
  );

  const posterSrc = hasPlayback
    ? posterUrl(playbackId, {
        time: posterTime,
        width: posterWidth,
      })
    : undefined;
  const animatedSrc =
    canAnimate && shouldLoadPreview
      ? animatedPreviewUrl(playbackId, {
          start: previewRange?.start,
          end: previewRange?.end,
          width: previewWidth,
        })
      : undefined;

  return (
    <button
      ref={rootRef}
      type="button"
      className={cn(
        "group relative w-full overflow-hidden bg-[color:var(--color-elevated)] outline-offset-4",
        !hasPlayback && "cursor-default",
      )}
      style={{ aspectRatio }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={
        hasPlayback ? `Open ${ariaLabel}` : `${ariaLabel} — coming soon`
      }
      data-cursor={hasPlayback ? "play" : undefined}
      tabIndex={hasPlayback ? 0 : -1}
    >
      {hasPlayback && posterSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            sizes={MUX_IMAGE_SIZES}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              hovered && previewLoaded && isPageVisible ? "opacity-0" : "opacity-100",
            )}
          />
          {animatedSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={animatedSrc}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                sizes={MUX_IMAGE_SIZES}
                onLoad={() => setPreviewLoaded(true)}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                  hovered && previewLoaded && isPageVisible ? "opacity-100" : "opacity-0",
                )}
              />
            </>
          ) : null}
        </>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-elevated)]"
          aria-hidden="true"
        >
          <span className="text-eyebrow text-[color:var(--color-dim)]">
            Coming Soon
          </span>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-xs font-mono text-[color:var(--color-foreground)]/80 sm:p-6">
        <span aria-hidden="true">
          {hasPlayback
            ? showAnimatedPreview && previewLoaded
              ? "PLAYING"
              : "PREVIEW"
            : "COMING SOON"}
        </span>
        {duration ? <span aria-hidden="true">{duration}</span> : null}
      </div>
    </button>
  );
}
