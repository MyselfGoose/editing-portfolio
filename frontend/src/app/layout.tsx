import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";

import { DeferredAnalytics } from "@/components/analytics/DeferredAnalytics";
import { ExperienceShell } from "@/components/experience/ExperienceShell";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { BRAND, SITE } from "@/lib/constants";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  axes: ["opsz", "SOFT"],
});

const DESCRIPTION =
  "Goose Productions finishes cinematic wedding films — editorial selects, structure, grade, and delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${BRAND.name} — Wedding Cinema`,
    template: `%s — ${BRAND.name}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND.name,
  authors: [{ name: BRAND.name, url: SITE.url }],
  keywords: [
    "wedding films",
    "wedding cinema",
    "video editing",
    "color grading",
    "celebration films",
    "Goose Productions",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${BRAND.name} — Wedding Cinema`,
    description: DESCRIPTION,
    siteName: BRAND.name,
    type: "website",
    url: SITE.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Wedding Cinema`,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>): React.ReactElement {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteJsonLd />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ExperienceShell>{children}</ExperienceShell>
        <DeferredAnalytics />
      </body>
    </html>
  );
}
