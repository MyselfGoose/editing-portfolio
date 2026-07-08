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

export function heroWordVariant(
  tier: DeviceTier,
  reducedMotion: boolean,
): Variants | undefined {
  if (reducedMotion) return undefined;
  if (tier === "mobile") {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.4, ease: EASE.expoOut },
      },
    };
  }

  return {
    hidden: { y: "110%" },
    visible: {
      y: "0%",
      transition: { duration: 0.9, ease: EASE.expoOut },
    },
  };
}

export function heroStagger(
  tier: DeviceTier,
  reducedMotion: boolean,
): Variants | undefined {
  if (reducedMotion) return undefined;
  const stagger = tier === "mobile" ? 0.05 : 0.09;
  const delay = tier === "mobile" ? 0.15 : 0.35;
  return {
    hidden: {},
    visible: {
      transition: { delayChildren: delay, staggerChildren: stagger },
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
