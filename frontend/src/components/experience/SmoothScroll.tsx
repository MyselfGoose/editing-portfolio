"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useExperience } from "@/components/providers/ExperienceProvider";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  refreshScrollLayout,
  registerLenis,
  resetScrollPosition,
} from "@/lib/scroll-layout";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProps {
  children?: React.ReactNode;
}

/**
 * Cinematic-route smooth scroll. Effect-only — does not wrap the tree so
 * SiteNav survives cinematic↔light mode switches. Lenis is dynamically
 * imported so light routes that never mount this component skip the module.
 */
export function SmoothScroll({
  children,
}: SmoothScrollProps): React.ReactElement {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const { isDesktop, finePointer } = useBreakpoint();
  const { scrollLocked } = useExperience();
  const lenisRef = useRef<Lenis | null>(null);
  const scrollLockedRef = useRef(scrollLocked);
  const isInitialPathnameRef = useRef(true);

  useEffect(() => {
    scrollLockedRef.current = scrollLocked;
  }, [scrollLocked]);

  const enableLenis = isDesktop && finePointer && !reducedMotion;

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    if (!enableLenis) {
      registerLenis(null);
      const onScroll = (): void => ScrollTrigger.update();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanup = () => {
        window.removeEventListener("scroll", onScroll);
        registerLenis(null);
        if (typeof window !== "undefined") {
          delete window.__portfolioScrollTo;
        }
      };
      return () => {
        cancelled = true;
        cleanup?.();
      };
    }

    void import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;

      const lenis = new LenisCtor({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.2,
        lerp: 0.1,
      });

      lenisRef.current = lenis;
      registerLenis(lenis);
      if (scrollLockedRef.current) {
        lenis.stop();
      }

      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          if (arguments.length && value !== undefined) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: document.documentElement.style.transform
          ? "transform"
          : "fixed",
      });

      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number): void => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      refreshScrollLayout();

      const resizeObserver = new ResizeObserver(() => {
        refreshScrollLayout();
      });
      resizeObserver.observe(document.body);

      cleanup = () => {
        resizeObserver.disconnect();
        gsap.ticker.remove(raf);
        lenis.destroy();
        lenisRef.current = null;
        registerLenis(null);
        if (typeof window !== "undefined") {
          delete window.__portfolioScrollTo;
        }
        ScrollTrigger.scrollerProxy(document.documentElement, {});
        refreshScrollLayout();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [enableLenis]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (scrollLocked) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [scrollLocked]);

  useEffect(() => {
    if (isInitialPathnameRef.current) {
      isInitialPathnameRef.current = false;
      return;
    }

    resetScrollPosition();
  }, [pathname]);

  useEffect(() => {
    if (enableLenis) return;

    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }, [enableLenis]);

  return <>{children}</>;
}
