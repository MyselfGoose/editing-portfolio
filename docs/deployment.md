# Deployment

How to deploy the Goose Productions portfolio to production on Vercel.

**Live site:** [https://goose-productions.com](https://goose-productions.com)

**Last verified against:** Next.js 16.2.9 (Part 4)

## Overview

Next.js App Router app from `frontend/` on Vercel. Database-free. Contact form via Resend; **Upstash rate limit required in production** (fail-closed if missing); optional Vercel Analytics.

## Vercel Setup

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Node.js | 20.x |

### Environment variables

Copy [`frontend/.env.example`](../frontend/.env.example) → `.env.local`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `RESEND_API_KEY` | Yes (contact) | Resend API key |
| `CONTACT_FORM_FROM` | Yes (contact) | Verified sender on `goose-productions.com` |
| `UPSTASH_REDIS_REST_URL` | **Required in production** | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | **Required in production** | Rate limiting |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Optional (`true` default) | Analytics mount |

**Upstash policy:** Local/preview without Redis env vars allows submissions (documented). **Production** without Upstash returns `503` (fail-closed) so the inbox cannot be abused. `sharp` is a runtime dependency for OG image generation; film OG routes re-encode ImageResponse output to JPEG under ~350KB.

Do not commit secrets. Server vars must not use `NEXT_PUBLIC_`.

### Resend

1. Verify domain `goose-productions.com` (SPF + DKIM)
2. Set `RESEND_API_KEY` + `CONTACT_FORM_FROM` in Vercel

### Upstash

1. Create Redis REST credentials
2. Set both Upstash vars in Vercel production

## Build verification

```bash
cd frontend
npm run check
npm run test:e2e
```

## Custom domain

`goose-productions.com` + `www` → apex redirect via `next.config.ts`. TLS via Vercel.

## Post-deploy checklist

Manual QA on production. Items marked **repo-verified** were validated via `npm run check` + e2e through launch polish; live env items need a human after deploy.

| Check | Pass criteria | Status |
|-------|---------------|--------|
| Home sections | Hero → About → Process → Work → StudioProof → Services → InvestmentNote → Contact CTA | repo-verified |
| `/films` archive | Filters, rows, modal, Watch Carezza | repo-verified |
| `/films/[slug]` | Film page + adjacent nav; OG branded JPEG under ~350KB | repo-verified |
| Light shell | `/contact` + `/privacy`: no Lenis, no grain, no cursor UI (`data-experience-mode=light`) | repo-verified |
| Cinematic restore | Contact → Home: Process scrub still works | repo-verified |
| Watch Carezza | Open/close; soft-nav clears overflow + route veil | repo-verified |
| Modal share | Modal does not write `?project=`; FilmShareLink → `/films/[slug]` | repo-verified |
| Contact form (live) | Submit on production → email arrives at `CONTACT.email` | **human** |
| Resend domain | SPF/DKIM verified; `CONTACT_FORM_FROM` works | **human** |
| Upstash rate limit | Vars present on Vercel Production; burst returns 429 | **human** |
| Analytics | Pageviews in Vercel Analytics when flag enabled | **human** |
| Share preview | Paste `/films/carezza-leanne` into Slack/iMessage — branded OG | **human** |
| Legacy `?project=` | Redirects to `/films/{id}` (not modal) | repo-verified |
| HTTPS + domain | Valid TLS on goose-productions.com | **human** (assumed if live) |
| Sitemap / robots | `/sitemap.xml`, `/robots.txt` 200 | repo-verified |
| 404 | Branded not-found | repo-verified |

## Production readiness

1. Confirm Resend domain verification in Resend dashboard
2. Confirm Upstash vars present in Vercel Production (required — form fails closed without them)
3. Confirm `NEXT_PUBLIC_ANALYTICS_ENABLED` intentional
4. Smoke contact form once on production
5. Spot-check OG: open `/films/carezza-leanne/opengraph-image` → JPEG, reasonable size
6. Spot-check shell: DevTools on `/contact` → `html[data-experience-mode=light]`, no `.film-grain`
7. Paste two film URLs into Slack/iMessage and confirm cards

## CI/CD

GitHub Actions: Lint, Typecheck, Unit & Component Tests, Build, E2E Tests, Ingest CLI Smoke.

## Related Documentation

- [Roadmap Decisions](roadmap-decisions.md) — decide-don’t-build register
- [Testing](testing.md)
- [Content Management](content-management.md)
- [Experience](experience.md)
