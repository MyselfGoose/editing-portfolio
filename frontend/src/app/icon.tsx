import { ImageResponse } from "next/og";

import { BRAND } from "@/lib/constants";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon(): ImageResponse {
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
            width: 16,
            height: 16,
            border: "1.75px solid #f5f5f5",
            borderRadius: 2,
            transform: "rotate(45deg)",
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: "absolute",
            fontSize: 12,
            fontFamily: "Georgia, serif",
            fontWeight: 600,
            letterSpacing: "-0.06em",
            lineHeight: 1,
          }}
        >
          {BRAND.short.charAt(0)}
        </div>
      </div>
    ),
    { ...size },
  );
}
