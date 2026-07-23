"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useExperience } from "@/components/providers/ExperienceProvider";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getExperienceMode } from "@/lib/experience-mode";
import {
  clearScrollLockArtifacts,
  focusMainLandmark,
} from "@/lib/route-lifecycle";

/**
 * GSAP-safe route transition: enter-only veil overlay.
 *
 * Never wraps page trees in AnimatePresence exit animations — those fight
 * ScrollTrigger pin spacers on Home Process and cause React removeChild errors.
 * The page swaps synchronously; the veil is a sibling fixed layer only.
 */
export function TransitionManager({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname() ?? "/";
  const reducedMotion = usePrefersReducedMotion();
  const { isDesktop, isMobile } = useBreakpoint();
  const { setScrollLocked } = useExperience();
  const previousPathRef = useRef<string | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const veilTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionRef = useRef({ reducedMotion, isDesktop, isMobile });

  useEffect(() => {
    motionRef.current = { reducedMotion, isDesktop, isMobile };
  }, [reducedMotion, isDesktop, isMobile]);

  useEffect(() => {
    const previous = previousPathRef.current;
    previousPathRef.current = pathname;

    clearScrollLockArtifacts();
    setScrollLocked(false);

    if (previous === null) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      focusMainLandmark();
    });

    const { reducedMotion: rm, isDesktop: desktop, isMobile: mobile } =
      motionRef.current;
    const fromMode = getExperienceMode(previous);
    const toMode = getExperienceMode(pathname);
    const cinematicPair =
      fromMode === "cinematic" && toMode === "cinematic";

    let durationMs: number;
    if (rm) {
      durationMs = 60;
    } else if (!cinematicPair) {
      durationMs = 120;
    } else if (mobile) {
      durationMs = 160;
    } else if (desktop) {
      durationMs = 280;
    } else {
      durationMs = 200;
    }

    const veil = veilRef.current;
    if (!veil) {
      return () => {
        window.cancelAnimationFrame(focusFrame);
      };
    }

    if (veilTimerRef.current !== null) {
      clearTimeout(veilTimerRef.current);
      veilTimerRef.current = null;
    }

    veil.style.transition = `opacity ${Math.max(40, Math.floor(durationMs * 0.45))}ms ease-out`;
    veil.style.opacity = "1";
    veil.setAttribute("aria-hidden", "false");

    const holdMs = Math.floor(durationMs * 0.35);
    veilTimerRef.current = setTimeout(() => {
      veil.style.transition = `opacity ${Math.max(40, Math.floor(durationMs * 0.55))}ms ease-out`;
      veil.style.opacity = "0";
      veilTimerRef.current = setTimeout(() => {
        veil.setAttribute("aria-hidden", "true");
        veilTimerRef.current = null;
      }, Math.floor(durationMs * 0.55) + 20);
    }, holdMs);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      if (veilTimerRef.current !== null) {
        clearTimeout(veilTimerRef.current);
        veilTimerRef.current = null;
      }
    };
  }, [pathname, setScrollLocked]);

  return (
    <div className="relative min-h-full">
      {children}
      <div
        ref={veilRef}
        className="pointer-events-none fixed inset-0 z-[55] bg-[color:var(--color-background)] opacity-0"
        aria-hidden="true"
        data-route-veil
      />
    </div>
  );
}
