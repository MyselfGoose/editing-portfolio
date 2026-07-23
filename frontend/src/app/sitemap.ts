import type { MetadataRoute } from "next";

import { projects } from "@/data/projects";
import { SITE } from "@/lib/constants";
import { filmUrl } from "@/lib/projects";

/** Stable build-time date — avoids per-request `new Date()` in sitemap. */
const SITE_LAST_MODIFIED = new Date("2026-07-15T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const filmEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: filmUrl(project.id),
    lastModified: SITE_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE.url,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE.url}/films`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...filmEntries,
    {
      url: `${SITE.url}/contact`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/privacy`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
