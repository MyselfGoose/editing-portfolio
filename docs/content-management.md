# Content Management

How to customize portfolio content — projects, brand identity, contact information, and placeholder conventions.

**Last verified against:** Next.js 16.2.9

## Overview

All content is defined as typed TypeScript constants. There is no CMS or database. To update content, edit the source files and redeploy.

## Brand and Contact

Edit [`frontend/src/lib/constants.ts`](../frontend/src/lib/constants.ts):

```typescript
export const BRAND = {
  name: "Goose Productions",
  short: "Goose",
  tagline: "[STUDIO TAGLINE]",
  handle: "@studio",
} as const;

export const CONTACT = {
  email: "hello@studio.com",
  ctaLabel: "START A PROJECT",
} as const;
```

These values appear in:

- Page metadata (`layout.tsx` title, description, Open Graph)
- Cinematic loader brand reveal
- Contact section CTA and email links
- Footer copyright

## Projects

Projects are defined in [`frontend/src/data/projects.ts`](../frontend/src/data/projects.ts).

### Project Schema

```typescript
interface Project {
  id: string;              // URL-safe slug (e.g. "the-wedding-film")
  index: number;           // Display order (1, 2, 3...)
  title: string;           // Project title
  category: ProjectCategory; // "Wedding Film" | "Documentary" | "Brand Story" | "Music Video"
  year: number;            // Release year
  location: string;        // Shoot location
  description: string;     // Short description (1-2 sentences)
  video: ProjectVideo;     // Video configuration (see below)
  credits: {
    role: string;          // Your role (e.g. "Editor / Colorist")
    client: string;        // Client name
  };
}
```

### Video Configuration

```typescript
interface ProjectVideo {
  playbackId: string;      // Mux playback ID or placeholder
  aspectRatio: VideoAspectRatio; // "16/9" | "9/16" | "4/3"
  duration: string;        // Display duration (e.g. "03:42")
  posterTime?: number;     // Seconds — frame for still poster
  previewRange?: {         // Seconds — hover animated preview window
    start: number;
    end: number;
  };
  captions?: ReadonlyArray<ProjectCaptionTrack>; // Optional VTT tracks
}
```

### Adding a New Project

1. Upload the video to Mux (see [Video Ingest](video-ingest.md))
2. Add a new entry to the `projects` array in `projects.ts`:

```typescript
{
  id: "new-project-slug",
  index: 4,
  title: "Project Title",
  category: "Documentary",
  year: 2026,
  location: "City, Country",
  description: "A brief description of the project.",
  video: {
    playbackId: "YOUR_MUX_PLAYBACK_ID",
    aspectRatio: "16/9",
    duration: "05:30",
    posterTime: 15,
    previewRange: { start: 10, end: 15 },
  },
  credits: {
    role: "Editor",
    client: "Client Name",
  },
},
```

3. Run `npm run build` to verify, then deploy.

## Placeholder Convention

Projects without a ready playback ID use bracketed placeholders:

```typescript
playbackId: "[PLAYBACK_ID_01]",
```

When `isRealPlaybackId()` detects a bracketed value, the UI:

- Shows **"Coming Soon"** instead of a video preview
- Disables the open button (`tabIndex={-1}`)
- Skips all Mux CDN requests
- Displays "Video coming soon" in the modal if opened programmatically

Replace the placeholder with a real Mux playback ID when the video is ready. See [Video Ingest](video-ingest.md) for the upload workflow.

## Shared Demo Video

Until each project has its own playback ID, all projects share a demo asset:

```typescript
// frontend/src/lib/constants.ts
export const MUX_DEMO_VIDEO = {
  playbackId: "VY8IzL32ULAQNLcjdnuNdZap9XXbtsJ7017vPd1jXl7Q",
  // ...
} as const;
```

Replace individual project `playbackId` values as assets become available.

## Section Content

Some section content is defined inline in component files:

| Section | File | Editable Content |
|---------|------|------------------|
| Services | `components/sections/Services.tsx` | Five craft chapters (title + description) |
| Process | `components/sections/Process.tsx` | Three edit stage frames (title + description) |
| Contact | `components/sections/Contact.tsx` | Credits roll (role + name pairs) |
| Hero | `components/sections/Hero.tsx` | Headline words, subtext |

## Loader Lines

The cinematic loader displays status lines defined in `constants.ts`:

```typescript
export const LOADER_LINES = [
  { label: "INITIALIZING VISUAL SYSTEM", status: "READY" },
  { label: "COLOR GRADING", status: "DONE" },
  // ...
] as const;
```

## Related Documentation

- [Video Ingest](video-ingest.md) — Mux upload workflow and playback IDs
- [Architecture](architecture.md) — Data flow and content pipeline
- [Deployment](deployment.md) — How to deploy content changes
