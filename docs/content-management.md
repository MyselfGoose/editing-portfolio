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
  tagline: "Wedding films finished as cinema",
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
- Footer copyright and brand mark
- Privacy page contact reference
- JSON-LD structured data

**Email note:** Contact form submissions are delivered to `CONTACT.email` via Resend. Outgoing mail is sent from a verified `goose-productions.com` domain address configured in Vercel env vars.

## Projects

Ten films are defined in [`frontend/src/data/projects.ts`](../frontend/src/data/projects.ts). Four are featured on the homepage via `FEATURED_PROJECT_IDS`.

Each uses a real Mux public playback ID and a required editorial `description` (about 60–320 characters).

### Project Schema

```typescript
interface Project {
  id: string;              // URL-safe slug (e.g. "carezza-leanne")
  index: number;           // Display order (1, 2, 3...)
  title: string;
  category: ProjectCategory; // "Wedding Film" | "Birthday Film"
  year: number;
  location: string;
  description: string;     // Required; shown on cards, modal, FilmsMoment, JSON-LD
  video: ProjectVideo;
  credits: { role: string; client: string };
}
```

Per-project `credits` (role + client) are the source of truth in ProjectCard / ProjectModal. There is no separate credit-roll module.

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

Add WebVTT files under `frontend/public/captions/` **only when you have accurate transcripts**. Reference them in `projects.ts`:

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

Do not ship stub or placeholder dialogue cues. Data-contract tests fail if a referenced caption file is missing or matches stub patterns.

### Adding a New Project

1. Upload the video via the [ingest CLI](../scripts/ingest/README.md) (or manually to Mux — see [Video Ingest](video-ingest.md))
2. Add a new entry to the `projects` array with a unique description (or use `ingest.sh apply` for video fields on existing entries)
3. Run `npm run check` and deploy

### Placeholder Convention

Bracketed playback IDs (e.g. `[PLAYBACK_ID_01]`) are still supported via `isRealPlaybackId()` — the UI shows "Coming Soon" without Mux requests. All current projects use real IDs.

### Shareable project links

Open a project modal via query param: `/?project=carezza-leanne`

## Section Content

| Section | File | Editable Content |
|---------|------|------------------|
| Hero | `components/sections/Hero.tsx` | Subtext; headline from `HEADLINE_LINES` in constants |
| About | `components/sections/About.tsx` | Copy; portrait from `ABOUT_IMAGE` in constants |
| Process | `components/sections/Process.tsx` | Editorial stage frames |
| Services | `components/sections/Services.tsx` | Offerings list |
| Contact | `components/contact/ContactPageContent.tsx` | Page copy; form; uses `SOCIAL` |

## Loader Lines

Defined in `constants.ts` (`LOADER_LINES`). Edit for brand voice.

## Brand assets

| Asset | Path | Notes |
|-------|------|-------|
| Logo | `public/brand/logo.svg` | Diamond + G mark; also shown in SiteFooter |
| Favicon / Apple icon | `app/icon.tsx`, `app/apple-icon.tsx` | Same mark family |
| About photo | `public/images/me.jpeg` via `ABOUT_IMAGE` | Descriptive `alt` in constants |
| OG image | Generated at `/opengraph-image` | Mux poster composited with brand text |

## Contact form configuration

The contact form posts to `/api/contact` and delivers submissions by email via Resend. See [Deployment](deployment.md) for Resend and Upstash env setup. If email delivery is not configured, the API returns a temporary-unavailable error and users can still reach out via the mailto link.

## Project categories

The schema supports only genres present in the archive: `Wedding Film` and `Birthday Film`. Do not add empty genre unions or fake projects to fill categories.

## Related Documentation

- [Video Ingest](video-ingest.md) — Mux upload workflow
- [Architecture](architecture.md) — Data flow
- [Deployment](deployment.md) — Deploy content changes
