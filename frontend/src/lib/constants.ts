export const BRAND = {
  name: "Goose Productions",
  short: "Goose",
  tagline: "Goose Productions Editing Portfolio",
  handle: "@gooseproductions",
} as const;

/** Headline display lines derived from brand tagline. */
export const HEADLINE_LINES: ReadonlyArray<ReadonlyArray<string>> = [
  ["Goose", "Productions"],
  ["Editing", "Portfolio"],
] as const;

/** Canonical production origin — used for metadata, sitemap, and JSON-LD. */
export const SITE = {
  url: "https://goose-productions.com",
} as const;

export const CONTACT = {
  /** Keep unless MX is configured for goose-productions.com — see emailNote. */
  email: "info@gooseproductions.com",
  ctaLabel: "START A PROJECT",
  /** Migrating to info@goose-productions.com requires DNS/MX changes — confirm with user first. */
  emailNote:
    "Domain-aligned email (info@goose-productions.com) requires MX record update.",
} as const;

export interface SocialLinks {
  readonly instagram?: string;
  readonly vimeo?: string;
  readonly youtube?: string;
}

/** Render social links in UI only when URLs are defined. */
export const SOCIAL: SocialLinks = {
  instagram: "https://instagram.com/gooseproductions",
} as const;

export const FORM = {
  endpoint:
    process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ??
    "https://api.formspree.io/f/demo",
  honeypotFieldName: "company",
} as const;

export const ANALYTICS = {
  enabled:
    (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED ?? "true").toLowerCase() !==
    "false",
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
  { label: "LOADING SELECTS", status: "READY" },
  { label: "CALIBRATING GRADE", status: "DONE" },
  { label: "LOCKING PICTURE", status: "DONE" },
  { label: "SETTING MOOD", status: "READY" },
] as const;

export const SESSION_KEYS = {
  loaderPlayed: "gp:loader-played",
} as const;

/** Hero background reel — Carezza Leanne wedding film. */
export const MUX_DEMO_VIDEO = {
  playbackId: "VY8IzL32ULAQNLcjdnuNdZap9XXbtsJ7017vPd1jXl7Q",
  title: "Carezza Leanne",
  posterTime: 4,
} as const;

/** About section still — swap src to /about.jpg when user provides asset. */
export const ABOUT_STILL = {
  playbackId: MUX_DEMO_VIDEO.playbackId,
  time: 4,
  alt: "A still frame from a Goose Productions wedding film",
} as const;
