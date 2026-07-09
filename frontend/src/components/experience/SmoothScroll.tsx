"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

import { useExperience } from "@/components/providers/ExperienceProvider";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { registerScrollToSection } from "@/lib/scroll-to-section";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps): React.ReactElement {
  const reducedMotion = usePrefersReducedMotion();
  const { isDesktop, finePointer } = useBreakpoint();
  const { scrollLocked } = useExperience();
  const lenisRef = useRef<Lenis | null>(null);

  const enableLenis =
    isDesktop && finePointer && !reducedMotion;

  useEffect(() => {
    if (!enableLenis) {
      const onScroll = (): void => ScrollTrigger.update();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      lerp: 0.1,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    registerScrollToSection((sectionId: string) => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      lenis.scrollTo(target, { offset: 0 });
    });

    const raf = (time: number): void => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      registerScrollToSection(null);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enableLenis]);

  useEffect(() => {
    if (!enableLenis) {
      registerScrollToSection(null);
    }
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

  return <>{children}</>;
}
