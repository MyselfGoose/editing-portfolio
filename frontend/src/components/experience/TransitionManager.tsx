"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

import { EASE } from "@/lib/constants";

interface TransitionManagerProps {
  children: React.ReactNode;
}

/**
 * Route-level fade transition. Wraps the app so client-side navigations
 * cross-fade instead of hard-swapping. The initial mount is intentionally
 * inert (`initial={false}`) so it doesn't fight the CinematicLoader.
 */
export function TransitionManager({
  children,
}: TransitionManagerProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE.smooth }}
        style={{ minHeight: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
