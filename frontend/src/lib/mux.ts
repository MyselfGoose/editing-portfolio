import { clamp } from "@/lib/utils";

const MUX_IMAGE_HOST = "https://image.mux.com";
const MUX_STREAM_HOST = "https://stream.mux.com";

export type VideoAspectRatio = "16/9" | "9/16" | "4/3";

export interface PosterUrlOptions {
  time?: number;
  width?: number;
}

export interface AnimatedPreviewUrlOptions {
  start?: number;
  end?: number;
  width?: number;
}

const PLACEHOLDER_PATTERN = /^\[.+\]$/;

function assertPlaybackId(playbackId: string): void {
  if (!playbackId.trim()) {
    throw new Error("Mux playbackId must be a non-empty string.");
  }
}

function buildImageUrl(
  playbackId: string,
  path: "thumbnail.webp" | "animated.webp",
  params: Record<string, string | number>,
): string {
  assertPlaybackId(playbackId);
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }
  const query = search.toString();
  return `${MUX_IMAGE_HOST}/${encodeURIComponent(playbackId)}/${path}${query ? `?${query}` : ""}`;
}

/**
 * Returns true when the playback ID is a real Mux ID (not a bracketed placeholder).
 */
export function isRealPlaybackId(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !PLACEHOLDER_PATTERN.test(trimmed);
}

/**
 * Still poster frame from Mux Image API.
 */
export function posterUrl(
  playbackId: string,
  opts: PosterUrlOptions = {},
): string {
  const time = clamp(opts.time ?? 0, 0, 86_400);
  const width = clamp(opts.width ?? 1920, 320, 3840);
  return buildImageUrl(playbackId, "thumbnail.webp", {
    time,
    width,
    fit_mode: "preserve",
  });
}

/**
 * Animated WebP loop for hover previews. Does not count as a Mux Data view.
 */
export function animatedPreviewUrl(
  playbackId: string,
  opts: AnimatedPreviewUrlOptions = {},
): string {
  const start = clamp(opts.start ?? 2, 0, 86_400);
  const end = clamp(opts.end ?? 6, start + 0.5, 86_400);
  const width = clamp(opts.width ?? 960, 320, 1920);
  return buildImageUrl(playbackId, "animated.webp", {
    start,
    end,
    width,
    fit_mode: "preserve",
  });
}

/**
 * HLS manifest URL for full playback.
 */
export function streamUrl(playbackId: string): string {
  assertPlaybackId(playbackId);
  return `${MUX_STREAM_HOST}/${encodeURIComponent(playbackId)}.m3u8`;
}

/** Mux Player quality presets — ABR picks the best ladder rung per context. */
export const MUX_PLAYER_PRESETS = {
  /** Fullscreen modal on desktop: up to 4K. */
  cinematic: {
    maxResolution: "2160p" as const,
    capRenditionToPlayerSize: true,
    streamType: "on-demand" as const,
  },
  /** Fullscreen modal on mobile/tablet: 1080p cap. */
  cinematicMobile: {
    maxResolution: "1080p" as const,
    capRenditionToPlayerSize: true,
    streamType: "on-demand" as const,
  },
  /** Hero background loop: 1080p max, muted autoplay. */
  ambient: {
    maxResolution: "1080p" as const,
    capRenditionToPlayerSize: true,
    streamType: "on-demand" as const,
  },
  /** Hero background loop on mobile: 720p cap for bandwidth. */
  ambientMobile: {
    maxResolution: "720p" as const,
    capRenditionToPlayerSize: true,
    streamType: "on-demand" as const,
  },
} as const;

export const MUX_IMAGE_DEFAULTS = {
  posterWidth: 1920,
  previewWidth: 1280,
} as const;
