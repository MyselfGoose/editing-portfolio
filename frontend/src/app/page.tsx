import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";

export default function Home(): React.ReactElement {
  return (
    <main id="main" className="relative min-h-[100svh] w-full">
      <Hero />
      <About />
      <Process />
      <FeaturedWork />
      <Services />
      <Contact />
    </main>
  );
}
