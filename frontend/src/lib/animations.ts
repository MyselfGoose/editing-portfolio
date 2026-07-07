import type { Transition, Variants } from "motion/react";

import { EASE } from "./constants";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE.expoOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: EASE.smooth },
  },
};

export const staggerParent = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      delayChildren: delay,
      staggerChildren: stagger,
    },
  },
});

export const maskedWord: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.9, ease: EASE.expoOut },
  },
};

export const revealClip: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 1.2, ease: EASE.cinematic },
  },
};

export const cursorSpring: Transition = {
  type: "spring",
  mass: 0.15,
  stiffness: 220,
  damping: 22,
};

export const modalTransition: Transition = {
  duration: 0.5,
  ease: EASE.smooth,
};
