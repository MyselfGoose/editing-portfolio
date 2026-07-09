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
            width: 18,
            height: 18,
            border: "2px solid #f5f5f5",
            borderRadius: 2,
            transform: "rotate(45deg)",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            fontSize: 11,
            fontFamily: "Georgia, serif",
            fontWeight: 600,
            letterSpacing: "-0.06em",
            marginTop: 1,
          }}
        >
          {BRAND.short.charAt(0)}
        </div>
      </div>
    ),
    { ...size },
  );
}
