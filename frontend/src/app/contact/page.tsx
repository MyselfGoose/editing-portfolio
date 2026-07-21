import type { Metadata } from "next";

import { ContactPageContent } from "@/components/contact/ContactPageContent";
import { PageShell } from "@/components/layout/PageShell";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a wedding film with Goose Productions — share the day, the footage, and your timeline.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — Goose Productions",
    description:
      "Start a wedding film with Goose Productions — share the day, the footage, and your timeline.",
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
