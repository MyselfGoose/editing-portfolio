import sharp from "sharp";

import { posterUrl } from "@/lib/mux";

/**
 * Fetch a Mux poster and convert to a PNG data URL for Satori/ImageResponse.
 * Returns null on network or decode failure so callers can fall back to typography OG.
 */
export async function loadPosterDataUrl(
  playbackId: string,
  options: { time: number; width?: number },
): Promise<string | null> {
  const poster = posterUrl(playbackId, {
    time: options.time,
    width: options.width ?? 1200,
  });

  try {
    const response = await fetch(poster);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const png = await sharp(buffer).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_CONTENT_TYPE = "image/png";
