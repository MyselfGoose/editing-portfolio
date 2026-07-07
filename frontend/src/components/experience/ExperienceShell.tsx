"use client";

import dynamic from "next/dynamic";

import { CursorProvider } from "./CursorContext";
import { CustomCursor } from "./CustomCursor";
import { SmoothScroll } from "./SmoothScroll";
import { TransitionManager } from "./TransitionManager";

const CinematicLoader = dynamic(() => import("./CinematicLoader"), {
  ssr: false,
});

interface ExperienceShellProps {
  children: React.ReactNode;
}

/**
 * Single client boundary that mounts the four experience systems in the
 * correct order:
 *   1. SmoothScroll - installs Lenis + GSAP ticker bridge (RAF)
 *   2. CursorProvider - state store for CustomCursor consumers
 *   3. CustomCursor - listens to CursorContext, renders the ring + dot + label
 *   4. CinematicLoader - overlay, one-shot per session
 *   5. TransitionManager - AnimatePresence for route changes
 * Everything below stays server-rendered by default.
 */
export function ExperienceShell({
  children,
}: ExperienceShellProps): React.ReactElement {
  return (
    <SmoothScroll>
      <CursorProvider>
        <CustomCursor />
        <CinematicLoader />
        <div className="film-grain" aria-hidden="true" />
        <TransitionManager>{children}</TransitionManager>
      </CursorProvider>
    </SmoothScroll>
  );
}
