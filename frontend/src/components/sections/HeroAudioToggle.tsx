"use client";

import { Volume2, VolumeX } from "lucide-react";

import { useCursor } from "@/components/experience/CursorContext";

import { useHeroMedia } from "./HeroMediaContext";

export function HeroAudioToggle(): React.ReactElement {
  const { isMuted, toggleMute } = useHeroMedia();
  const { setState, reset } = useCursor();

  return (
    <button
      type="button"
      onClick={toggleMute}
      onMouseEnter={() => setState({ kind: "open" })}
      onMouseLeave={reset}
      onFocus={() => setState({ kind: "open" })}
      onBlur={reset}
      aria-pressed={!isMuted}
      aria-label={isMuted ? "Unmute hero video" : "Mute hero video"}
      data-cursor="open"
      className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/50 text-[color:var(--color-foreground)] backdrop-blur-sm transition-transform duration-300 hover:scale-105 hover:border-white/40 hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--color-foreground)]"
    >
      {isMuted ? (
        <VolumeX size={22} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Volume2 size={22} strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}
