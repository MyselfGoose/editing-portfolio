import { BRAND, CONTACT, SITE } from "@/lib/constants";

const DESCRIPTION =
  "A cinematic video studio. We don't edit videos. We create memories.";

export function SiteJsonLd(): React.ReactElement {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: BRAND.name,
    url: SITE.url,
    description: DESCRIPTION,
    email: CONTACT.email,
    areaServed: "Worldwide",
    serviceType: [
      "Wedding Films",
      "Video Editing",
      "Color Grading",
      "Motion Design",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
