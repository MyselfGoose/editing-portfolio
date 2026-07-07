import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";

import { ExperienceShell } from "@/components/experience/ExperienceShell";
import { BRAND } from "@/lib/constants";

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
  preload: true,
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — Cinematic Video Studio`,
    template: `%s — ${BRAND.name}`,
  },
  description:
    "A cinematic video studio. We don't edit videos. We create memories.",
  applicationName: BRAND.name,
  authors: [{ name: BRAND.name }],
  keywords: [
    "video editing",
    "cinematography",
    "color grading",
    "wedding films",
    "documentary",
    "brand films",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: `${BRAND.name} — Cinematic Video Studio`,
    description:
      "A cinematic video studio. We don't edit videos. We create memories.",
    siteName: BRAND.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Cinematic Video Studio`,
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
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ExperienceShell>{children}</ExperienceShell>
      </body>
    </html>
  );
}
