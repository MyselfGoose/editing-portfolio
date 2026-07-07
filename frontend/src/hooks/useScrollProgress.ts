"use client";

import { useEffect, useState } from "react";

import { clamp } from "@/lib/utils";

/**
 * Global 0..1 scroll progress. Reads from `window` so it works with any
 * scroller (including Lenis, which mutates native scroll under the hood).
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;
    const update = (): void => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const next = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      setProgress(next);
    };

    const onScroll = (): void => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return progress;
}
