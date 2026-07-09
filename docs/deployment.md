# Deployment

How to deploy the Goose Productions portfolio to production on Vercel.

**Live site:** [https://goose-productions.com](https://goose-productions.com)

**Last verified against:** Next.js 16.2.9

## Overview

The portfolio is a Next.js App Router application deployed from the `frontend/` directory on Vercel. It remains database-free, but now includes optional analytics and an env-driven contact form endpoint.

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

Copy `frontend/.env.example` to `.env.local` for local development.

| Variable | Required | Scope | Purpose |
|----------|----------|-------|---------|
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Yes (for contact form) | Public | Formspree endpoint used by contact form submit |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Optional (`true` default) | Public | Enables/disables Vercel Analytics mount |

Notes:
- Do not commit real keys/secrets.
- This site still does not require DB credentials or private backend tokens.

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
| Contact form submit | Valid submission shows success status without reload | [ ] |
| Page metadata | Title, description, OG image on share previews | [x] |
| Favicon | Tab shows branded icon | [x] |
| Sitemap + robots | `/sitemap.xml` and `/robots.txt` return 200 | [x] |
| Desktop navigation | At 1024px+: top nav links jump to all sections | [ ] |
| Deep link | `/?project=carezza-leanne` opens correct modal | [ ] |
| 404 page | `/nonexistent` shows branded not-found | [ ] |
| Privacy route | `/privacy` renders and is linked in contact footer | [ ] |
| Analytics | Pageviews visible in Vercel Analytics dashboard after deploy | [ ] |

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
