import dynamic from "next/dynamic";

import { Hero } from "@/components/sections/Hero";
import { HomeContactCta } from "@/components/sections/HomeContactCta";
import { SectionSkeleton } from "@/components/sections/SectionSkeleton";

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

const Services = dynamic(
  () => import("@/components/sections/Services").then((m) => m.Services),
  { loading: () => <SectionSkeleton /> },
);

export default function Home(): React.ReactElement {
  return (
    <main id="main" className="relative min-h-[100svh] w-full">
      <Hero />
      <About />
      <Process />
      <FeaturedWork />
      <Services />
      <HomeContactCta />
    </main>
  );
}
