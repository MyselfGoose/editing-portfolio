export const BREAKPOINTS = {
  xs: 320,
  sm: 390,
  md: 768,
  lg: 1024,
  xl: 1440,
  "2xl": 1920,
} as const;

export type DeviceTier = "mobile" | "tablet" | "desktop";

export const MEDIA = {
  mobile: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
  finePointer: `(pointer: fine)`,
  coarsePointer: `(pointer: coarse)`,
  reducedMotion: `(prefers-reduced-motion: reduce)`,
} as const;

export function tierFromWidth(width: number): DeviceTier {
  if (width < BREAKPOINTS.md) return "mobile";
  if (width < BREAKPOINTS.lg) return "tablet";
  return "desktop";
}

export function posterWidthForTier(tier: DeviceTier): number {
  switch (tier) {
    case "mobile":
      return 640;
    case "tablet":
      return 960;
    case "desktop":
      return 1280;
  }
}

export function previewWidthForTier(tier: DeviceTier): number {
  switch (tier) {
    case "mobile":
      return 640;
    case "tablet":
      return 960;
    case "desktop":
      return 1280;
  }
}

export const MUX_IMAGE_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";
