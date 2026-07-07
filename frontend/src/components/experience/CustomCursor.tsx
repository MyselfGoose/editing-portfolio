"use client";

import { useEffect, useRef } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = usePrefersReducedMotion();
  const { state } = useCursor();

  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });

  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("cursor-hidden");
      return;
    }

    document.documentElement.classList.add("cursor-hidden");

    const handlePointerMove = (event: PointerEvent): void => {
      targetRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerDown = (): void => {
      const ring = ringRef.current;
      if (!ring) return;
      ring.style.transform = ring.style.transform + " scale(0.85)";
    };

    const handlePointerUp = (): void => {
      // Re-sync via next raf tick; transform is rewritten every frame anyway.
    };

    const loop = (): void => {
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
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove("cursor-hidden");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

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
