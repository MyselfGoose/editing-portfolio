import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { Hero } from "@/components/sections/Hero";
import { HomeContactCta } from "@/components/sections/HomeContactCta";
import { SectionSkeleton } from "@/components/sections/SectionSkeleton";
import { resolveProjectQueryRedirect } from "@/lib/projects";

const About = dynamic(
  () => import("@/components/sections/About").then((m) => m.About),
  { loading: () => <SectionSkeleton /> },
);

const Process = dynamic(
  () => import("@/components/sections/Process").then((m) => m.Process),
  { loading: () => <SectionSkeleton /> },
);

const FeaturedWork = dynamic(
  () => import("@/components/sections/FeaturedWork").then((m) => m.FeaturedWork),
  { loading: () => <SectionSkeleton /> },
);

const StudioProof = dynamic(
  () => import("@/components/sections/StudioProof").then((m) => m.StudioProof),
  { loading: () => <SectionSkeleton /> },
);

const Services = dynamic(
  () => import("@/components/sections/Services").then((m) => m.Services),
  { loading: () => <SectionSkeleton /> },
);

const InvestmentNote = dynamic(
  () =>
    import("@/components/sections/InvestmentNote").then(
      (m) => m.InvestmentNote,
    ),
  { loading: () => <SectionSkeleton /> },
);

interface HomePageProps {
  searchParams: Promise<{ project?: string | string[] }>;
}

export default async function Home({
  searchParams,
}: HomePageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const redirectPath = resolveProjectQueryRedirect(params.project);
  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <main id="main" className="relative min-h-[100svh] w-full">
      <Hero />
      <About />
      <Process />
      <FeaturedWork />
      <StudioProof />
      <Services />
      <InvestmentNote />
      <HomeContactCta />
    </main>
  );
}
