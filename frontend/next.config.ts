import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.goose-productions.com" }],
        destination: "https://goose-productions.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
