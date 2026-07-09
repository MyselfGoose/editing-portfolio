"use client";

import MuxVideo from "@mux/mux-video-react";
import { useEffect } from "react";

import { useHydrationSafeBreakpoint } from "@/hooks/useHydrationSafeBreakpoint";
import { useMounted } from "@/hooks/useMounted";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MUX_IMAGE_SIZES, posterWidthForTier } from "@/lib/breakpoints";
import { MUX_DEMO_VIDEO } from "@/lib/constants";
import { MUX_PLAYER_PRESETS, posterUrl } from "@/lib/mux";
import { pauseVideo, playVideo } from "@/lib/video-lifecycle";

import { useHeroMedia } from "./HeroMediaContext";
import { HeroPlayerBoundary } from "./HeroPlayerBoundary";

export function HeroBackdrop(): React.ReactElement {
  const mounted = useMounted();
  const { tier, isDesktop, finePointer, isHydrated } = useHydrationSafeBreakpoint();
  const reducedMotion = usePrefersReducedMotion();
  const isPageVisible = usePageVisibility();
  const showVideo =
    mounted && isHydrated && isDesktop && finePointer && !reducedMotion;

  const { isMuted, registerVideo, videoRef } = useHeroMedia();
  const { playbackId, title } = MUX_DEMO_VIDEO;
  const posterWidth = posterWidthForTier(tier);
  const poster = posterUrl(playbackId, {
    time: 0,
    width: posterWidth,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted, videoRef]);

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!isPageVisible) {
      pauseVideo(video);
      return;
    }
    playVideo(video);
  }, [isPageVisible, showVideo, videoRef]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${poster})` }}
        role="img"
        aria-hidden="true"
      />
      {showVideo ? (
        <HeroPlayerBoundary playbackId={playbackId}>
          <MuxVideo
            ref={(el: HTMLVideoElement | null) => registerVideo(el)}
            playbackId={playbackId}
            streamType={MUX_PLAYER_PRESETS.ambient.streamType}
            maxResolution={MUX_PLAYER_PRESETS.ambient.maxResolution}
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
