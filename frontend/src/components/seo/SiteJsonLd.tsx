import { BRAND, CONTACT, SITE, SOCIAL } from "@/lib/constants";

const DESCRIPTION =
  "Goose Productions finishes cinematic wedding films — editorial selects, structure, grade, and delivery.";

function socialUrls(): string[] {
  return Object.values(SOCIAL).filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  );
}

export function SiteJsonLd(): React.ReactElement {
  const sameAs = socialUrls();
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: BRAND.name,
    url: SITE.url,
    description: DESCRIPTION,
    email: CONTACT.email,
    foundingDate: "2019",
    image: `${SITE.url}/opengraph-image`,
    logo: `${SITE.url}/icon`,
    areaServed: "Worldwide",
    ...(sameAs.length > 0 ? { sameAs } : {}),
    serviceType: [
      "Wedding Films",
      "Celebration Films",
      "Video Editing",
      "Color Grading",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
