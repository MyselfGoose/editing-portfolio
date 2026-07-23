import sharp from "sharp";
import type { ImageResponse } from "next/og";

import { posterUrl } from "@/lib/mux";

export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

/** Final share-card format — JPEG keeps photo OG under ~300KB after Satori. */
export const OG_CONTENT_TYPE = "image/jpeg";

/**
 * Fetch a Mux poster and convert to a compressed PNG data URL for Satori/ImageResponse.
 * Resizes to OG canvas so the compositor starts from a bounded bitmap.
 * Returns null on network or decode failure so callers can fall back to typography OG.
 */
export async function loadPosterDataUrl(
  playbackId: string,
  options: { time: number; width?: number },
): Promise<string | null> {
  const fetchWidth = Math.min(options.width ?? OG_SIZE.width, OG_SIZE.width);
  const poster = posterUrl(playbackId, {
    time: options.time,
    width: fetchWidth,
  });

  try {
    const response = await fetch(poster);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const png = await sharp(buffer)
      .resize(OG_SIZE.width, OG_SIZE.height, {
        fit: "cover",
        position: "centre",
      })
      .png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 })
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Re-encode an ImageResponse (typically huge PNG) to a share-friendly JPEG.
 * Satori does not honor input PNG compression; this is the size gate for crawlers.
 */
export async function finalizeOgImage(
  image: ImageResponse,
): Promise<Response> {
  const raw = Buffer.from(await image.arrayBuffer());
  const jpeg = await sharp(raw)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": OG_CONTENT_TYPE,
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
    },
  });
}
