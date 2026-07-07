"use client";

import MuxPlayer from "@mux/mux-player-react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MUX_DEMO_VIDEO } from "@/lib/constants";
import { MUX_IMAGE_DEFAULTS, MUX_PLAYER_PRESETS, posterUrl } from "@/lib/mux";

/**
 * Cinematic hero background using the shared Mux placeholder asset.
 * Falls back to a static poster on small screens and when reduced motion
 * is preferred — no autoplay in those cases.
 */
export function HeroBackdrop(): React.ReactElement {
  const isSmall = useMediaQuery("(max-width: 640px)");
  const reducedMotion = usePrefersReducedMotion();
  const still = isSmall || reducedMotion;

  const { playbackId, title } = MUX_DEMO_VIDEO;
  const poster = posterUrl(playbackId, {
    time: 0,
    width: MUX_IMAGE_DEFAULTS.posterWidth,
  });

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {still ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
        />
      ) : (
        <MuxPlayer
          playbackId={playbackId}
          streamType={MUX_PLAYER_PRESETS.ambient.streamType}
          maxResolution={MUX_PLAYER_PRESETS.ambient.maxResolution}
          capRenditionToPlayerSize={
            MUX_PLAYER_PRESETS.ambient.capRenditionToPlayerSize
          }
          muted
          autoPlay
          loop
          playsInline
          nohotkeys
          preload="auto"
          poster={poster}
          metadata={{ video_title: title }}
          className="mux-hero-bg pointer-events-none absolute inset-0 h-full w-full"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            aspectRatio: "16/9",
            "--controls": "none",
            "--media-object-fit": "cover",
          }}
        />
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
