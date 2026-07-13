# Content Management

How to customize portfolio content — projects, brand identity, contact information, and asset conventions.

**Last verified against:** Next.js 16.2.9

## Overview

All content is defined as typed TypeScript constants. There is no CMS or database. To update content, edit the source files and redeploy.

**Live site:** [https://goose-productions.com](https://goose-productions.com)

## Brand and Contact

Edit [`frontend/src/lib/constants.ts`](../frontend/src/lib/constants.ts):

```typescript
export const BRAND = {
  name: "Goose Productions",
  short: "Goose",
  tagline: "We don't edit videos. We create memories.",
  handle: "@gooseproductions",
} as const;

export const CONTACT = {
  email: "gooseproductionsstudio@gmail.com",
  ctaLabel: "START A PROJECT",
} as const;

export const SOCIAL = {
  instagram: "https://instagram.com/gooseproductions",
} as const;
```

These values appear in:

- Page metadata (`layout.tsx` title, description, Open Graph)
- Cinematic loader brand reveal
- Contact section CTA, email links, and social links
- Footer copyright
- Privacy page contact reference
- JSON-LD structured data

**Email note:** Contact form submissions are delivered to `CONTACT.email` via Resend. Outgoing mail is sent from a verified `goose-productions.com` domain address configured in Vercel env vars.

## Projects

Four real projects are defined in [`frontend/src/data/projects.ts`](../frontend/src/data/projects.ts):

1. Carezza Leanne
2. Meghan and Edward
3. Elvira
4. Dominguez Quince

Each uses a real Mux public playback ID.

### Project Schema

```typescript
interface Project {
  id: string;              // URL-safe slug (e.g. "carezza-leanne")
  index: number;           // Display order (1, 2, 3...)
  title: string;
  category: ProjectCategory;
  year: number;
  location: string;
  description: string;
  video: ProjectVideo;
  credits: { role: string; client: string };
}
```

### Video Configuration

```typescript
interface ProjectVideo {
  playbackId: string;
  aspectRatio: VideoAspectRatio;
  duration: string;
  posterTime?: number;
  previewRange?: { start: number; end: number };
  captions?: ReadonlyArray<ProjectCaptionTrack>;
}
```

### Captions (VTT)

Add WebVTT files under `frontend/public/captions/` and reference them in `projects.ts`:

```typescript
captions: [
  {
    src: "/captions/carezza-leanne.en.vtt",
    srcLang: "en",
    label: "English",
    default: true,
  },
],
```

Alternatively, upload text tracks in the Mux dashboard and use the Mux-hosted URL.

Current placeholder/stub tracks are stored for all four projects so caption files can be replaced in-place.

### Adding a New Project

1. Upload the video via the [ingest CLI](../scripts/ingest/README.md) (or manually to Mux — see [Video Ingest](video-ingest.md))
2. Add a new entry to the `projects` array (or use `ingest.sh apply` for video fields on existing entries)
3. Run `npm run check` and deploy

### Placeholder Convention

Bracketed playback IDs (e.g. `[PLAYBACK_ID_01]`) are still supported via `isRealPlaybackId()` — the UI shows "Coming Soon" without Mux requests. All current projects use real IDs.

### Shareable project links

Open a project modal via query param: `/?project=carezza-leanne`

## Credits

End-credit roll entries live in [`frontend/src/data/credits.ts`](../frontend/src/data/credits.ts). Replace placeholder names when real credits are known.

## Section Content

| Section | File | Editable Content |
|---------|------|------------------|
| Hero | `components/sections/Hero.tsx` | Subtext; headline from `HEADLINE_LINES` in constants |
| About | `components/sections/About.tsx` | Copy; still from `ABOUT_STILL` in constants |
| Process | `components/sections/Process.tsx` | Three editorial stage frames |
| Services | `components/sections/Services.tsx` | Five service chapters |
| Contact | `components/sections/Contact.tsx` | Uses `CREDITS` and `SOCIAL` data |

## Loader Lines

Defined in `constants.ts` (`LOADER_LINES`). Edit for brand voice.

## Brand assets

| Asset | Path | Fallback |
|-------|------|----------|
| Logo | `public/brand/logo.svg` | Programmatic icon in `icon.tsx` / `apple-icon.tsx` |
| About photo | `public/about.jpg` | Mux still via `ABOUT_STILL` |
| OG image | Generated at `/opengraph-image` | Mux poster composited with brand text |

Replace `public/brand/logo.svg` with the final approved studio mark when available.

## Contact form configuration

The contact form posts to `/api/contact` and delivers submissions by email via Resend. See [Deployment](deployment.md) for Resend and Upstash env setup. If email delivery is not configured, the API returns a temporary-unavailable error and users can still reach out via the mailto link.

## Project categories

The schema supports `Wedding Film`, `Celebration Film`, `Documentary`, `Brand Story`, and `Music Video`. Do not add fake projects to fill categories.

## Related Documentation

- [Video Ingest](video-ingest.md) — Mux upload workflow
- [Architecture](architecture.md) — Data flow
- [Deployment](deployment.md) — Deploy content changes
