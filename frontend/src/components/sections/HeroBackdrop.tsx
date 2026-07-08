"use client";

import MuxVideo from "@mux/mux-video-react";
import { useEffect } from "react";

import { useIsClient } from "@/hooks/useIsClient";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MUX_DEMO_VIDEO } from "@/lib/constants";
import { MUX_IMAGE_DEFAULTS, MUX_PLAYER_PRESETS, posterUrl } from "@/lib/mux";

import { useHeroMedia } from "./HeroMediaContext";
import { HeroPlayerBoundary } from "./HeroPlayerBoundary";

/**
 * Cinematic hero background using MuxVideo (lightweight HLS, no player chrome).
 */
export function HeroBackdrop(): React.ReactElement {
  const isSmall = useMediaQuery("(max-width: 640px)");
  const reducedMotion = usePrefersReducedMotion();
  const mounted = useIsClient();
  const still = isSmall || reducedMotion;

  const { isMuted, registerVideo, videoRef } = useHeroMedia();
  const { playbackId, title } = MUX_DEMO_VIDEO;
  const poster = posterUrl(playbackId, {
    time: 0,
    width: MUX_IMAGE_DEFAULTS.posterWidth,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted, videoRef]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {still || !mounted ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
        />
      ) : (
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
            preload="auto"
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
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0) 30%, rgba(10,10,10,0) 70%, rgba(10,10,10,0.85) 100%)",
        }}
      />
    </div>
  );
}
