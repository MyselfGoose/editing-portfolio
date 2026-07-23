import { ImageResponse } from "next/og";

import { BRAND } from "@/lib/constants";
import { isRealPlaybackId } from "@/lib/mux";
import {
  finalizeOgImage,
  loadPosterDataUrl,
  OG_CONTENT_TYPE,
  OG_SIZE,
} from "@/lib/og-poster";
import { getFilmStaticParams, getProjectById } from "@/lib/projects";

export const alt = `Film — ${BRAND.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams(): Array<{ slug: string }> {
  return getFilmStaticParams().map((entry) => ({ slug: entry.slug }));
}

interface FilmOpenGraphProps {
  params: Promise<{ slug: string }>;
}

export default async function FilmOpenGraphImage({
  params,
}: FilmOpenGraphProps): Promise<Response> {
  const { slug } = await params;
  const project = getProjectById(slug);

  const title = project?.title ?? "Film";
  const eyebrow = project
    ? `${project.category} / ${project.year}`
    : "Studio Archive";

  let posterDataUrl: string | null = null;
  if (project && isRealPlaybackId(project.video.playbackId)) {
    posterDataUrl = await loadPosterDataUrl(project.video.playbackId, {
      time: project.video.posterTime ?? 8,
      width: 1200,
    });
  }

  return finalizeOgImage(
    new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            position: "relative",
            background: posterDataUrl
              ? "#0a0a0a"
              : "linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 55%, #050505 100%)",
            color: "#f5f5f5",
          }}
        >
                          {posterDataUrl ? (
            <img
              src={posterDataUrl}
              alt=""
              width={1200}
              height={630}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.45,
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -55%)",
                fontSize: 160,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                fontFamily: "Georgia, serif",
                opacity: 0.06,
                display: "flex",
              }}
            >
              FILM
            </div>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.92) 75%)",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              padding: "72px",
            }}
          >
            <div
              style={{
                fontSize: 24,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(245,245,245,0.55)",
                fontFamily: "monospace",
                marginBottom: 24,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                fontSize: title.length > 28 ? 56 : 68,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                fontFamily: "Georgia, serif",
                maxWidth: 960,
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: 40,
                fontSize: 22,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(245,245,245,0.7)",
                fontFamily: "monospace",
              }}
            >
              {BRAND.name}
            </div>
          </div>
        </div>
      ),
      { ...size },
    ),
  );
}
