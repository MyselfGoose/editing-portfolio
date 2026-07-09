import type { Transition, Variants } from "motion/react";

import type { DeviceTier } from "@/lib/breakpoints";
import { EASE } from "@/lib/constants";

export function sectionReveal(tier: DeviceTier): Variants {
  if (tier === "mobile") {
    return {
      hidden: { opacity: 0, y: 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: EASE.expoOut },
      },
    };
  }

  return {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: EASE.expoOut },
    },
  };
}

export function modalMotion(tier: DeviceTier): {
  overlay: Transition;
  panel: Variants;
} {
  if (tier === "mobile") {
    return {
      overlay: { duration: 0.35, ease: EASE.smooth },
      panel: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      },
    };
  }

  return {
    overlay: { duration: 0.5, ease: EASE.smooth },
    panel: {
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 24 },
    },
  };
}
