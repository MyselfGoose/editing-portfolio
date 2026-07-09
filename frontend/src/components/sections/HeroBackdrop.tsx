"use client";

import MuxVideo from "@mux/mux-video-react";
import { useCallback, useEffect, useState } from "react";

import { useHydrationSafeBreakpoint } from "@/hooks/useHydrationSafeBreakpoint";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useCinematicCapabilities } from "@/lib/cinematic-capabilities";
import { MUX_IMAGE_SIZES, posterWidthForTier } from "@/lib/breakpoints";
import { MUX_DEMO_VIDEO } from "@/lib/constants";
import { MUX_PLAYER_PRESETS, posterUrl } from "@/lib/mux";
import { pauseVideo, playVideo } from "@/lib/video-lifecycle";

import { useHeroMedia } from "./HeroMediaContext";
import { HeroPlayerBoundary } from "./HeroPlayerBoundary";

export function HeroBackdrop(): React.ReactElement {
  const { tier } = useHydrationSafeBreakpoint();
  const { canPlayAmbientVideo } = useCinematicCapabilities();
  const isPageVisible = usePageVisibility();
  const [posterError, setPosterError] = useState(false);

  const { isMuted, registerVideo, videoRef } = useHeroMedia();
  const { playbackId, title, posterTime } = MUX_DEMO_VIDEO;
  const posterWidth = posterWidthForTier(tier);
  const poster = posterUrl(playbackId, {
    time: posterTime,
    width: posterWidth,
  });
  const videoPreset =
    tier === "mobile"
      ? MUX_PLAYER_PRESETS.ambientMobile
      : MUX_PLAYER_PRESETS.ambient;

  const handlePosterError = useCallback((): void => {
    setPosterError(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted, videoRef]);

  useEffect(() => {
    if (!canPlayAmbientVideo) return;
    const video = videoRef.current;
    if (!isPageVisible) {
      pauseVideo(video);
      return;
    }
    playVideo(video);
  }, [canPlayAmbientVideo, isPageVisible, videoRef]);

  useEffect(() => {
    if (!canPlayAmbientVideo) return;

    const resumePlayback = (): void => {
      if (!document.hidden) {
        playVideo(videoRef.current);
      }
    };

    window.addEventListener("pageshow", resumePlayback);
    document.addEventListener("visibilitychange", resumePlayback);
    return () => {
      window.removeEventListener("pageshow", resumePlayback);
      document.removeEventListener("visibilitychange", resumePlayback);
    };
  }, [canPlayAmbientVideo, videoRef]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {!posterError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          sizes={MUX_IMAGE_SIZES}
          onError={handlePosterError}
        />
      ) : (
        <div className="absolute inset-0 bg-[color:var(--color-elevated)]" />
      )}
      {canPlayAmbientVideo ? (
        <HeroPlayerBoundary
          playbackId={playbackId}
          posterTime={posterTime}
          posterWidth={posterWidth}
        >
          <MuxVideo
            ref={(el: HTMLVideoElement | null) => registerVideo(el)}
            playbackId={playbackId}
            streamType={videoPreset.streamType}
            maxResolution={videoPreset.maxResolution}
            capRenditionToPlayerSize={videoPreset.capRenditionToPlayerSize}
            muted={isMuted}
            autoPlay
            loop
            playsInline
            preload="metadata"
            poster={poster}
            disablePictureInPicture
            disableRemotePlayback
            metadata={{ video_title: title }}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </HeroPlayerBoundary>
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0) 30%, rgba(10,10,10,0) 70%, rgba(10,10,10,0.85) 100%)",
        }}
      />
      <span className="sr-only" data-image-sizes={MUX_IMAGE_SIZES} />
    </div>
  );
}
