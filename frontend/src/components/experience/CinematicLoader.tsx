"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useRef, useState } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  BRAND,
  DURATION,
  LOADER_LINES,
  SESSION_KEYS,
} from "@/lib/constants";

interface CinematicLoaderProps {
  onFinish?: () => void;
}

function readPlayedFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEYS.loaderPlayed) === "1";
  } catch {
    return false;
  }
}

export default function CinematicLoader({
  onFinish,
}: CinematicLoaderProps): React.ReactElement | null {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Lazy initializer reads sessionStorage during first client render.
  // Safe because this module is only mounted via next/dynamic(..., { ssr: false }).
  const [alreadyPlayed] = useState<boolean>(readPlayedFlag);
  const [mounted, setMounted] = useState<boolean>(() => !readPlayedFlag());

  const rootRef = useRef<HTMLDivElement | null>(null);
  const linesRef = useRef<Array<HTMLLIElement | null>>([]);
  const countersRef = useRef<Array<HTMLSpanElement | null>>([]);
  const brandRef = useRef<HTMLDivElement | null>(null);
  const outroRef = useRef<HTMLDivElement | null>(null);

  const markPlayed = useCallback((): void => {
    try {
      window.sessionStorage.setItem(SESSION_KEYS.loaderPlayed, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const finish = useCallback((): void => {
    markPlayed();
    setMounted(false);
    onFinish?.();
  }, [markPlayed, onFinish]);

  useGSAP(
    () => {
      if (!mounted || alreadyPlayed) return;
      const root = rootRef.current;
      if (!root) return;

      if (reducedMotion) {
        gsap.set(root, { autoAlpha: 1 });
        const t = window.setTimeout(finish, 400);
        return () => window.clearTimeout(t);
      }

      const totalScale = isMobile
        ? DURATION.loader.mobile / DURATION.loader.desktop
        : 1;

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: finish,
      });

      tl.set(root, { autoAlpha: 1 });

      LOADER_LINES.forEach((_, i) => {
        const line = linesRef.current[i];
        const counter = countersRef.current[i];
        if (!line) return;

        const state = { value: 0 };
        tl.fromTo(
          line,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.35 * totalScale },
          i === 0 ? 0.15 : "-=0.15",
        );

        if (counter) {
          tl.to(
            state,
            {
              value: 100,
              duration: 0.55 * totalScale,
              ease: "power2.out",
              onUpdate: () => {
                counter.textContent = String(Math.floor(state.value))
                  .padStart(3, " ")
                  .replace(/ /g, "\u00A0");
              },
            },
            "<0.05",
          );
        }
      });

      tl.fromTo(
        brandRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.9 * totalScale },
        `+=${0.2 * totalScale}`,
      );

      tl.to(
        outroRef.current,
        {
          scaleY: 0,
          transformOrigin: "top center",
          duration: DURATION.loader.outroMs / 1000,
          ease: "expo.inOut",
        },
        `+=${0.3 * totalScale}`,
      );

      return () => {
        tl.kill();
      };
    },
    { dependencies: [mounted, alreadyPlayed, reducedMotion, isMobile, finish], scope: rootRef },
  );

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="loader-root" style={{ visibility: "hidden" }}>
      <div
        ref={outroRef}
        aria-hidden="true"
        className="absolute inset-0 bg-black"
        style={{ transformOrigin: "top center" }}
      />

      <div className="relative flex w-full max-w-3xl flex-col gap-16 px-8">
        <ul className="flex flex-col gap-3 font-mono text-xs sm:text-sm">
          {LOADER_LINES.map((line, i) => (
            <li
              key={line.label}
              ref={(el: HTMLLIElement | null) => {
                linesRef.current[i] = el;
              }}
              className="flex items-baseline justify-between gap-6 text-[color:var(--color-muted)]"
              style={{ visibility: "hidden" }}
            >
              <span className="tracking-[0.25em] uppercase">{line.label}</span>
              <span className="flex items-baseline gap-3">
                <span
                  ref={(el: HTMLSpanElement | null) => {
                    countersRef.current[i] = el;
                  }}
                  className="tabular-nums text-[color:var(--color-foreground)]"
                >
                  {"\u00A0\u00A0\u00A00"}
                </span>
                <span className="text-[color:var(--color-foreground)]">
                  {line.status}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div
          ref={brandRef}
          className="loader-flicker text-center"
          style={{ visibility: "hidden" }}
        >
          <p className="text-eyebrow text-[color:var(--color-muted)]">
            WELCOME TO
          </p>
          <p className="font-display mt-4 text-3xl sm:text-5xl md:text-6xl">
            {BRAND.name.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
