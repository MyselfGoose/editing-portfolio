import { ImageResponse } from "next/og";

import { BRAND } from "@/lib/constants";

export const alt = `${BRAND.name} — Cinematic Video Studio`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px",
          background: "linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 55%, #050505 100%)",
          color: "#f5f5f5",
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
    ),
    { ...size },
  );
}
