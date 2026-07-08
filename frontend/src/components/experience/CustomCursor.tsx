"use client";

import { useEffect, useRef } from "react";

import { useExperience } from "@/components/providers/ExperienceProvider";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { lerp } from "@/lib/utils";

import { useCursor, type CursorState } from "./CursorContext";

function labelFor(state: CursorState): string {
  switch (state.kind) {
    case "play":
      return state.label ?? "PLAY";
    case "open":
      return state.label ?? "OPEN";
    default:
      return "";
  }
}

export function CustomCursor(): React.ReactElement | null {
  const { finePointer, isHydrated } = useBreakpoint();
  const reducedMotion = usePrefersReducedMotion();
  const { scrollLocked } = useExperience();
  const { state } = useCursor();

  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });
  const pausedRef = useRef<boolean>(false);

  const enabled = isHydrated && finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("cursor-hidden");
      return;
    }

    document.documentElement.classList.add("cursor-hidden");

    const handlePointerMove = (event: PointerEvent): void => {
      targetRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleVisibility = (): void => {
      pausedRef.current = document.hidden || scrollLocked;
    };

    const loop = (): void => {
      if (!pausedRef.current) {
        const target = targetRef.current;
        const current = currentRef.current;
        current.x = lerp(current.x, target.x, 0.18);
        current.y = lerp(current.y, target.y, 0.18);

        const ring = ringRef.current;
        const dot = dotRef.current;
        const label = labelRef.current;
        if (ring) {
          ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
        }
        if (dot) {
          dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
        }
        if (label) {
          label.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    pausedRef.current = document.hidden || scrollLocked;
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove("cursor-hidden");
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, scrollLocked]);

  if (!enabled) return null;

  const label = labelFor(state);
  const showLabel = label.length > 0;

  return (
    <>
      <div
        ref={ringRef}
        className="cursor-ring"
        data-state={state.kind}
        aria-hidden="true"
      />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div
        ref={labelRef}
        className="cursor-label"
        data-visible={showLabel}
        aria-hidden="true"
      >
        {label}
      </div>
    </>
  );
}
