import { projects } from "@/data/projects";
import { BRAND, SITE } from "@/lib/constants";
import { isRealPlaybackId, posterUrl, streamUrl } from "@/lib/mux";

function durationToISO8601(duration: string): string {
  const parts = duration.split(":");
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return `PT${minutes}M${seconds}S`;
  }
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return `PT${hours}H${minutes}M${seconds}S`;
  }
  return `PT0S`;
}

export function FilmsJsonLd(): React.ReactElement {
  const items = projects
    .filter((p) => isRealPlaybackId(p.video.playbackId))
    .map((project, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      item: {
        "@type": "VideoObject" as const,
        name: project.title,
        description: project.description,
        thumbnailUrl: posterUrl(project.video.playbackId, {
          time: project.video.posterTime,
          width: 1280,
        }),
        contentUrl: streamUrl(project.video.playbackId),
        duration: durationToISO8601(project.video.duration),
        uploadDate: `${project.year}-01-01`,
        creator: {
          "@type": "Organization" as const,
          name: BRAND.name,
          url: SITE.url,
        },
      },
    }));

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Films — ${BRAND.name}`,
    description: `Browse the wedding and celebration film archive by ${BRAND.name}.`,
    numberOfItems: items.length,
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
