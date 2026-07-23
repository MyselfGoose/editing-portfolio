# Testing

How to run, write, and debug tests for the Goose Productions portfolio.

**Last verified against:** Next.js 16.2.9 (Part 4)

## Overview

| Layer | Tool | What it tests |
|-------|------|---------------|
| Unit | Vitest | Pure helpers (`experience-mode`, `mux`, `route-lifecycle`, …) |
| Component | Vitest + Testing Library | React components and interactions |
| E2E | Playwright | Full browser flows, a11y, visual snapshots |

Visual regression lives in `e2e/visual.spec.ts` (`toHaveScreenshot`).

## Commands

```bash
cd frontend
npm run test
npm run test:coverage
npm run test:e2e
npm run check          # lint → typecheck → test → build
```

First-time Playwright: `npx playwright install chromium`

## E2E inventory (`frontend/e2e/`)

| Spec | Covers |
|------|--------|
| `home.spec.ts` | Sections, skip link, branded 404 |
| `loader.spec.ts` | Loader focus trap |
| `hero.spec.ts` | Desktop audio toggle |
| `project-modal.spec.ts` | Open/close, adjacent, legacy `?project=` redirect |
| `navigation.spec.ts` | Desktop + mobile → contact |
| `accessibility.spec.ts` | axe critical + serious contrast; reduced motion |
| `responsive.spec.ts` | Overflow, nav, film/showreel viewports |
| `scroll-reliability.spec.ts` | Process scrub; contact↔home Process restore |
| `films.spec.ts` | Archive, filters, modal, Films nav |
| `films-slug.spec.ts` | Film pages, adjacent nav, unknown slug |
| `contact.spec.ts` | Mailto, expectations, form success |
| `showreel.spec.ts` | Open/close from hero + films hero |
| `mobile-cinematic.spec.ts` | Mobile ambient + process pin |
| `experience-shell.spec.ts` | Light vs cinematic shell; OG JPEG size; scroll-lock cleanup |
| `visual.spec.ts` | Home snapshots (mobile/tablet/desktop) + modal |

## Coverage

Thresholds in `vitest.config.ts`. Shell/animation sections are e2e-covered and excluded from unit coverage where configured.

## CI Pipeline

| Job | Command |
|-----|---------|
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Unit & Component Tests | `npm run test:coverage` |
| Build | `npm run build` |
| E2E Tests | `npm run test:e2e` (needs unit + build) |
| Ingest CLI Smoke | `scripts/ingest/test/run-smoke.sh` |

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

## Related Documentation

- [Project Structure](project-structure.md)
- [Accessibility](accessibility.md)
- [Deployment](deployment.md)
