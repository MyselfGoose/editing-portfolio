import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FilmJsonLd } from "@/components/films/FilmJsonLd";
import { FilmPageView } from "@/components/films/FilmPageView";
import { BRAND } from "@/lib/constants";
import {
  filmPath,
  filmUrl,
  getAdjacentFilms,
  getFilmStaticParams,
  getProjectById,
} from "@/lib/projects";

interface FilmPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getFilmStaticParams().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: FilmPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectById(slug);

  if (!project) {
    return {
      title: "Film not found",
    };
  }

  const title = `${project.title} — ${BRAND.name}`;
  const description = project.description;
  const canonical = filmPath(project.id);

  // Open Graph / Twitter images come from colocated opengraph-image.tsx
  // (branded Mux poster compositor). Do not override with raw Mux URLs.
  return {
    title: project.title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: filmUrl(project.id),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function FilmPage({
  params,
}: FilmPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const project = getProjectById(slug);

  if (!project) {
    notFound();
  }

  const adjacent = getAdjacentFilms(project.id);

  return (
    <>
      <FilmJsonLd slug={project.id} />
      <main id="main" className="relative min-h-[100svh] w-full">
        <FilmPageView project={project} adjacent={adjacent} />
      </main>
    </>
  );
}
