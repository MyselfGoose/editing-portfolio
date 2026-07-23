import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FilmsStage } from "@/components/films/FilmsStage";
import { FilmsJsonLd } from "@/components/seo/FilmsJsonLd";
import { BRAND, SITE } from "@/lib/constants";
import { resolveProjectQueryRedirect } from "@/lib/projects";

const DESCRIPTION =
  "Browse cinematic wedding and celebration films by Goose Productions.";

export const metadata: Metadata = {
  title: "Films",
  description: DESCRIPTION,
  alternates: { canonical: "/films" },
  openGraph: {
    title: `Films — ${BRAND.name}`,
    description: DESCRIPTION,
    type: "website",
    url: `${SITE.url}/films`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Films — ${BRAND.name}`,
    description: DESCRIPTION,
  },
};

interface FilmsPageProps {
  searchParams: Promise<{ project?: string | string[] }>;
}

export default async function FilmsPage({
  searchParams,
}: FilmsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const redirectPath = resolveProjectQueryRedirect(params.project);
  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <>
      <FilmsJsonLd />
      <main id="main" className="relative min-h-[100svh] w-full">
        <FilmsStage />
      </main>
    </>
  );
}
