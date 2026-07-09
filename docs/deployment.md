# Deployment

How to deploy the Goose Productions portfolio to production on Vercel.

**Live site:** [https://goose-productions.com](https://goose-productions.com)

**Last verified against:** Next.js 16.2.9

## Overview

The portfolio is a static Next.js application with no backend, database, or environment variables. Deployment is a single Vercel project pointing at the `frontend/` directory.

## Vercel Setup

### 1. Connect Repository

1. Sign in to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Import the `editing-portfolio` repository from GitHub
4. Configure the project settings below

### 2. Project Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | (Next.js default — leave empty) |
| **Install Command** | `npm install` |
| **Node.js Version** | 20.x |

### 3. Environment Variables

**None required.** The application uses public Mux playback IDs hardcoded in the source. No API keys, database URLs, or secrets are needed for the website to function.

If you later add scripted Mux uploads (`scripts/ingest.ts`), you would add:

| Variable | Purpose |
|----------|---------|
| `MUX_TOKEN_ID` | Mux API token ID (server-side only) |
| `MUX_TOKEN_SECRET` | Mux API token secret (server-side only) |

These are not used by the website itself.

### 4. Deploy

Push to the `main` branch (or your production branch). Vercel builds and deploys automatically.

Preview deployments are created for every pull request.

## Build Verification

Before deploying, verify the build locally:

```bash
cd frontend
npm run check
```

This runs lint, typecheck, unit tests, and production build in sequence.

## Custom Domain

Production domain: **goose-productions.com**

1. In Vercel project settings, go to **Domains**
2. Add your custom domain (e.g. `goose-productions.com`)
3. Add `www.goose-productions.com` and point it to the same project (redirects to apex via `next.config.ts`)
4. Configure DNS as instructed by Vercel (CNAME or A record)
5. Vercel provisions TLS automatically

## Post-Deploy Checklist

Manual QA on [goose-productions.com](https://goose-productions.com). Mark pass/fail per item.

| Check | Pass criteria | Status |
|-------|---------------|--------|
| Home page sections | Hero, About, Process, Work, Services, Contact visible after loader | [x] |
| Custom domain + HTTPS | `https://goose-productions.com` resolves with valid TLS | [x] |
| Cinematic loader | First visit in new tab: loader plays and dismisses; revisit skips | [ ] |
| Project poster previews | Work section cards show Mux poster frames | [ ] |
| Project modal playback | Click project → fullscreen modal → Mux Player plays | [ ] |
| Contact mailto | `START A PROJECT` and email link open mail client to `info@gooseproductions.com` | [ ] |
| Page metadata | Title, description, OG image on share previews | [x] |
| Favicon | Tab shows branded icon | [x] |
| Sitemap + robots | `/sitemap.xml` and `/robots.txt` return 200 | [x] |
| Desktop navigation | At 1024px+: top nav links jump to all sections | [ ] |
| Deep link | `/?project=carezza-leanne` opens correct modal | [ ] |
| 404 page | `/nonexistent` shows branded not-found | [ ] |

## CI/CD

GitHub Actions runs on every push and pull request:

1. ESLint
2. TypeScript type checking
3. Vitest unit and component tests (with coverage thresholds)
4. Production build
5. Playwright e2e tests

See [Testing](testing.md) for CI details.

## Related Documentation

- [Getting Started](getting-started.md) — Local development setup
- [Content Management](content-management.md) — How to update content before deploying
- [Video Ingest](video-ingest.md) — Adding new videos before deploy
- [Troubleshooting](troubleshooting.md) — Deploy issues
