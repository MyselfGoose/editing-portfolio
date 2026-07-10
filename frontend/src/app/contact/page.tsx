import type { Metadata } from "next";

import { ContactPageContent } from "@/components/contact/ContactPageContent";
import { PageShell } from "@/components/layout/PageShell";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with Goose Productions — cinematic wedding films, documentaries, and brand stories.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — Goose Productions",
    description:
      "Start a project with Goose Productions — cinematic wedding films, documentaries, and brand stories.",
    url: `${SITE.url}/contact`,
  },
};

export default function ContactPage(): React.ReactElement {
  return (
    <PageShell>
      <ContactPageContent />
    </PageShell>
  );
}
