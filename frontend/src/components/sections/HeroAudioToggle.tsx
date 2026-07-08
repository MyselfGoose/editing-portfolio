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
      className="group flex w-full items-center justify-center gap-3 border border-[color:var(--color-divider)] px-4 py-2.5 transition-colors hover:border-[color:var(--color-muted)] hover:bg-[color:var(--color-elevated)] sm:w-auto"
    >
      {isMuted ? (
        <VolumeX size={16} strokeWidth={1.25} aria-hidden="true" />
      ) : (
        <Volume2 size={16} strokeWidth={1.25} aria-hidden="true" />
      )}
      <span className="text-eyebrow text-[color:var(--color-muted)] group-hover:text-[color:var(--color-foreground)]">
        {isMuted ? "Sound Off" : "Sound On"}
      </span>
    </button>
  );
}
