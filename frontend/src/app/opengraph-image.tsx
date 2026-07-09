import { ImageResponse } from "next/og";
import sharp from "sharp";

import { BRAND, MUX_DEMO_VIDEO } from "@/lib/constants";
import { posterUrl } from "@/lib/mux";

export const alt = `${BRAND.name} — Cinematic Video Studio`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadPosterDataUrl(): Promise<string | null> {
  const poster = posterUrl(MUX_DEMO_VIDEO.playbackId, {
    time: 8,
    width: 1200,
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

export default async function OpenGraphImage(): Promise<ImageResponse> {
  const posterDataUrl = await loadPosterDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          background: posterDataUrl
            ? "#0a0a0a"
            : "linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 55%, #050505 100%)",
          color: "#f5f5f5",
        }}
      >
        {posterDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterDataUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.45,
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.92) 75%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "72px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(245,245,245,0.55)",
              fontFamily: "monospace",
              marginBottom: 24,
            }}
          >
            Cinematic Video Studio
          </div>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontFamily: "Georgia, serif",
              maxWidth: 900,
            }}
          >
            {BRAND.tagline}
          </div>
          <div
            style={{
              marginTop: 40,
              fontSize: 24,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(245,245,245,0.7)",
              fontFamily: "monospace",
            }}
          >
            {BRAND.name}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
