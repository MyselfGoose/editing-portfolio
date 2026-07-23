import { projects } from "@/data/projects";
import { BRAND, SITE } from "@/lib/constants";
import { isRealPlaybackId, posterUrl, streamUrl } from "@/lib/mux";
import { filmUrl } from "@/lib/projects";

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

interface FilmJsonLdProps {
  slug: string;
}

export function FilmJsonLd({ slug }: FilmJsonLdProps): React.ReactElement | null {
  const project = projects.find((entry) => entry.id === slug);
  if (!project || !isRealPlaybackId(project.video.playbackId)) {
    return null;
  }

  const data = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: project.title,
    description: project.description,
    thumbnailUrl: posterUrl(project.video.playbackId, {
      time: project.video.posterTime,
      width: 1280,
    }),
    contentUrl: streamUrl(project.video.playbackId),
    url: filmUrl(project.id),
    duration: durationToISO8601(project.video.duration),
    uploadDate: `${project.year}-01-01`,
    creator: {
      "@type": "Organization",
      name: BRAND.name,
      url: SITE.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
