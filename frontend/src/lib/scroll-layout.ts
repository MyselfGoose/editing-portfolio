import type Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let activeLenis: Lenis | null = null;
let refreshFrameId = 0;

declare global {
  interface Window {
    /** Test and debug hook for driving Lenis/native scroll consistently. */
    __portfolioScrollTo?: (top: number) => void;
  }
}

/** Registered by SmoothScroll when Lenis is active. */
export function registerLenis(lenis: Lenis | null): void {
  activeLenis = lenis;
  if (typeof window !== "undefined") {
    window.__portfolioScrollTo = scrollToPosition;
  }
}

export function getActiveLenis(): Lenis | null {
  return activeLenis;
}

export function scrollToPosition(top: number): void {
  window.scrollTo(0, top);
  activeLenis?.scrollTo(top, { immediate: true });
}

function runScrollLayoutRefresh(): void {
  ScrollTrigger.refresh();
  activeLenis?.resize();
}

/**
 * Recalculate ScrollTrigger pin spacers and Lenis scroll limits after layout changes.
 * Coalesced to one refresh per animation frame to avoid pin/resize feedback loops.
 */
export function refreshScrollLayout(): void {
  if (typeof window === "undefined") {
    runScrollLayoutRefresh();
    return;
  }

  if (refreshFrameId !== 0) {
    cancelAnimationFrame(refreshFrameId);
  }

  refreshFrameId = window.requestAnimationFrame(() => {
    refreshFrameId = 0;
    runScrollLayoutRefresh();
  });
}

export function resetScrollPosition(): void {
  if (refreshFrameId !== 0) {
    cancelAnimationFrame(refreshFrameId);
    refreshFrameId = 0;
  }
  scrollToPosition(0);
  activeLenis?.resize();
  ScrollTrigger.refresh();
}
