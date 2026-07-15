import type { Metadata } from "next";

import { FilmsStage } from "@/components/films/FilmsStage";
import { FilmsJsonLd } from "@/components/seo/FilmsJsonLd";
import { BRAND, SITE } from "@/lib/constants";

const DESCRIPTION =
  "Browse the complete collection of cinematic wedding films, birthday films, and client projects by Goose Productions.";

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

export default function FilmsPage(): React.ReactElement {
  return (
    <>
      <FilmsJsonLd />
      <main id="main" className="relative min-h-[100svh] w-full">
        <FilmsStage />
      </main>
    </>
  );
}
