export const BRAND = {
  name: "Goose Productions",
  short: "Goose",
  tagline: "We don't edit videos. We create memories.",
  handle: "@gooseproductions",
} as const;

/** Canonical production origin — used for metadata, sitemap, and JSON-LD. */
export const SITE = {
  url: "https://goose-productions.com",
} as const;

export const CONTACT = {
  email: "info@gooseproductions.com",
  ctaLabel: "START A PROJECT",
} as const;

export { BREAKPOINTS } from "@/lib/breakpoints";

export const DURATION = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
  loader: {
    desktop: 2600,
    mobile: 1500,
    outroMs: 600,
  },
} as const;

export const EASE = {
  expoOut: [0.16, 1, 0.3, 1] as const,
  smooth: [0.65, 0, 0.35, 1] as const,
  cinematic: [0.83, 0, 0.17, 1] as const,
};

export const LOADER_LINES = [
  { label: "INITIALIZING VISUAL SYSTEM", status: "READY" },
  { label: "COLOR GRADING", status: "DONE" },
  { label: "FRAME ANALYSIS", status: "DONE" },
  { label: "STORY ENGINE", status: "READY" },
] as const;

export const SESSION_KEYS = {
  loaderPlayed: "gp:loader-played",
} as const;

/** Hero background reel — Carezza Leanne wedding film. */
export const MUX_DEMO_VIDEO = {
  playbackId: "VY8IzL32ULAQNLcjdnuNdZap9XXbtsJ7017vPd1jXl7Q",
  title: "Carezza Leanne",
} as const;

/** @deprecated Use MUX_DEMO_VIDEO */
export const MUX_PLACEHOLDER = MUX_DEMO_VIDEO;
