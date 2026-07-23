export type ExperienceMode = "cinematic" | "light";

/**
 * Classifies App Router pathnames into cinematic vs light experience shells.
 * Pure / hydration-safe — no React or window access.
 */
export function getExperienceMode(pathname: string): ExperienceMode {
  if (pathname === "/" || pathname === "/films" || pathname.startsWith("/films/")) {
    return "cinematic";
  }
  return "light";
}

export function isCinematicMode(pathname: string): boolean {
  return getExperienceMode(pathname) === "cinematic";
}
