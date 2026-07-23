"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef, useState } from "react";

import type { Project } from "@/data/projects";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { posterWidthForTier } from "@/lib/breakpoints";
import {
  isRealPlaybackId,
  MUX_PLAYER_PRESETS,
  posterUrl,
} from "@/lib/mux";
import { pauseMuxPlayer, playMuxPlayer } from "@/lib/video-lifecycle";

interface FilmPlayerProps {
  project: Project;
  /** When false, do not autoplay on mount/visibility (e.g. reduced-motion showreel). */
  autoPlay?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function FilmPlayer({
  project,
  autoPlay = true,
  className,
  "aria-label": ariaLabel,
}: FilmPlayerProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { tier, isDesktop } = useBreakpoint();
  const isPageVisible = usePageVisibility();
  const [failedProjectId, setFailedProjectId] = useState<string | null>(null);
  const failed = failedProjectId === project.id;

  const playerPreset = isDesktop
    ? MUX_PLAYER_PRESETS.cinematic
    : MUX_PLAYER_PRESETS.cinematicMobile;

  const hasPlayback = isRealPlaybackId(project.video.playbackId);
  const poster = hasPlayback
    ? posterUrl(project.video.playbackId, {
        time: project.video.posterTime,
        width: posterWidthForTier(tier),
      })
    : undefined;

  useEffect(() => {
    if (!hasPlayback || failed || !containerRef.current) return;

    let cancelled = false;
    let attempts = 0;

    const syncPlayback = (): void => {
      if (cancelled || !containerRef.current) return;

      const player = containerRef.current.querySelector("mux-player");
      if (!player) {
        if (attempts < 24) {
          attempts += 1;
          requestAnimationFrame(syncPlayback);
        }
        return;
      }

      try {
        if (!isPageVisible || !autoPlay) {
          pauseMuxPlayer(player as HTMLElement);
        } else {
          playMuxPlayer(player as HTMLElement);
        }
      } catch {
        /* Mux player may not be fully initialized yet */
      }
    };

    syncPlayback();

    const container = containerRef.current;
    return () => {
      cancelled = true;
      const player = container?.querySelector("mux-player");
      if (player) {
        pauseMuxPlayer(player as HTMLElement);
      }
    };
  }, [isPageVisible, project.id, hasPlayback, failed, autoPlay]);

  return (
    <div
      ref={containerRef}
      className={className ?? "relative w-full overflow-hidden bg-black"}
      style={{ aspectRatio: project.video.aspectRatio }}
    >
      {hasPlayback && !failed ? (
        <MuxPlayer
          playbackId={project.video.playbackId}
          streamType={playerPreset.streamType}
          maxResolution={playerPreset.maxResolution}
          capRenditionToPlayerSize={playerPreset.capRenditionToPlayerSize}
          poster={poster}
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
          aria-label={ariaLabel ?? `${project.title} — full video`}
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
      ) : hasPlayback && failed ? (
        <div className="relative flex h-full min-h-[240px] flex-col items-center justify-center gap-3">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element -- error fallback poster only
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          ) : null}
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
  );
}
