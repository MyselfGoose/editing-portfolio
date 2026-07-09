import type { Variants } from "motion/react";

import { useHydrationSafeBreakpoint } from "@/hooks/useHydrationSafeBreakpoint";
import { useMounted } from "@/hooks/useMounted";
import { sectionReveal } from "@/lib/motion-presets";

export function useRevealMotion(): {
  variants: Variants;
  initial: false | "hidden";
} {
  const mounted = useMounted();
  const { tier } = useHydrationSafeBreakpoint();

  return {
    variants: sectionReveal(tier),
    initial: mounted ? "hidden" : false,
  };
}
