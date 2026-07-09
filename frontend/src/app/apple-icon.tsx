import { ImageResponse } from "next/og";

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
          fontSize: 96,
          fontFamily: "Georgia, serif",
          fontWeight: 600,
          letterSpacing: "-0.04em",
        }}
      >
        G
      </div>
    ),
    { ...size },
  );
}
