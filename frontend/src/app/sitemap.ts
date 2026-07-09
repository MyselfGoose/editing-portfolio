import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";

/** Stable build-time date — avoids per-request `new Date()` in sitemap. */
const SITE_LAST_MODIFIED = new Date("2026-07-09T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE.url}/privacy`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
