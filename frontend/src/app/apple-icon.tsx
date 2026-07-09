import { ImageResponse } from "next/og";

import { BRAND } from "@/lib/constants";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#f5f5f5",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            border: "6px solid #f5f5f5",
            borderRadius: 8,
            transform: "rotate(45deg)",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            fontSize: 52,
            fontFamily: "Georgia, serif",
            fontWeight: 600,
            letterSpacing: "-0.06em",
          }}
        >
          {BRAND.short.charAt(0)}
        </div>
      </div>
    ),
    { ...size },
  );
}
