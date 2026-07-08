"use client";

/**
 * Route-level wrapper. Intentionally avoids AnimatePresence here — exit
 * animations fight GSAP ScrollTrigger pin spacers and cause React DOM
 * removeChild errors on this single-page experience.
 */
export function TransitionManager({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <div className="min-h-full">{children}</div>;
}
