# Deployment

How to deploy the Goose Productions portfolio to production on Vercel.

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

1. In Vercel project settings, go to **Domains**
2. Add your custom domain (e.g. `gooseproductions.com`)
3. Configure DNS as instructed by Vercel (CNAME or A record)
4. Vercel provisions TLS automatically

## Post-Deploy Checklist

- [ ] Home page loads with all sections visible
- [ ] Cinematic loader plays on first visit
- [ ] Project video previews show poster frames
- [ ] Clicking a project opens the fullscreen modal with Mux Player
- [ ] Contact email link opens mail client
- [ ] Page metadata (title, description, Open Graph) is correct
- [ ] Favicon displays

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
