"use client";

import { useEffect, useRef } from "react";

export type MousePosition = { x: number; y: number };

/**
 * RAF-throttled pointer tracker. Returns a mutable ref instead of state so
 * consumers can drive DOM writes without triggering React re-renders.
 */
export function useMousePosition(enabled = true): React.RefObject<MousePosition> {
  const positionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<MousePosition | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const handleMove = (event: PointerEvent): void => {
      pendingRef.current = { x: event.clientX, y: event.clientY };
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingRef.current) {
          positionRef.current = pendingRef.current;
          pendingRef.current = null;
        }
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled]);

  return positionRef;
}
