# Project Structure

A file-by-file map of the Goose Productions portfolio source code.

**Last verified against:** Next.js 16.2.9

## Repository Layout

```
portfolio/
├── docs/                    # Documentation (this folder)
├── frontend/                # Next.js application
│   ├── src/                 # Application source
│   ├── e2e/                 # Playwright end-to-end tests
│   ├── public/              # Static assets (favicon, SVGs)
│   ├── package.json         # Dependencies and scripts
│   ├── next.config.ts       # Next.js configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vitest.config.ts     # Vitest test configuration
│   ├── playwright.config.ts # Playwright e2e configuration
│   └── eslint.config.mjs    # ESLint configuration
└── README.md                # Repository overview
```

## Application Source (`frontend/src/`)

### App Router (`src/app/`)

| File | Type | Purpose |
|------|------|---------|
| `layout.tsx` | Server | Root layout — fonts, metadata, skip link, `ExperienceShell` wrapper |
| `page.tsx` | Server | Home page — composes all six sections in order |
| `globals.css` | — | Tailwind imports, CSS variables, typography, loader styles, film grain |
| `favicon.ico` | — | Site favicon |

### Components — Experience (`src/components/experience/`)

| File | Type | Purpose |
|------|------|---------|
| `ExperienceShell.tsx` | Client | Mounts all experience systems (scroll, cursor, loader, grain, transitions) |
| `SmoothScroll.tsx` | Client | Lenis smooth scroll + GSAP ticker RAF bridge |
| `CursorContext.tsx` | Client | React context for custom cursor state (`default`, `play`, `open`) |
| `CustomCursor.tsx` | Client | Renders the cursor ring, dot, and label; hidden on reduced motion |
| `CinematicLoader.tsx` | Client | Session one-shot intro overlay with GSAP timeline |
| `TransitionManager.tsx` | Client | AnimatePresence wrapper for route change transitions |

### Components — Projects (`src/components/projects/`)

| File | Type | Purpose |
|------|------|---------|
| `ProjectCard.tsx` | Client | Project list item with metadata, description, and video preview |
| `ProjectModal.tsx` | Client | Fullscreen modal with Mux Player, focus trap, Escape to close |
| `VideoPreview.tsx` | Client | Poster + animated hover preview button with cursor integration |

### Components — Sections (`src/components/sections/`)

| File | Type | Purpose |
|------|------|---------|
| `Hero.tsx` | Client | Full-viewport hero with ambient video reel and word-masked headline |
| `HeroBackdrop.tsx` | Client | Mux video element for hero background loop |
| `HeroMediaContext.tsx` | Client | React context for hero audio muted/unmuted state |
| `HeroAudioToggle.tsx` | Client | Toggle button for hero audio on/off |
| `HeroPlayerBoundary.tsx` | Client | Error boundary around hero video player |
| `About.tsx` | Server | Studio note section with Mux poster still |
| `Process.tsx` | Client | GSAP ScrollTrigger scrub of three edit stages (desktop) |
| `FeaturedWork.tsx` | Client | Project list with dynamic modal import |
| `Services.tsx` | Server | Five craft "chapters" describing services |
| `Contact.tsx` | Client | Contact CTA, credits roll, and footer |

### Data (`src/data/`)

| File | Purpose |
|------|---------|
| `projects.ts` | `Project` interface, `ProjectVideo`, `ProjectCaptionTrack` types, and `projects` array |

### Hooks (`src/hooks/`)

| File | Purpose |
|------|---------|
| `useIsClient.ts` | Returns `true` after hydration (safe gate for browser APIs) |
| `useMediaQuery.ts` | Subscribes to `matchMedia` and returns boolean match state |
| `usePrefersReducedMotion.ts` | Shorthand for `(prefers-reduced-motion: reduce)` |
| `useMousePosition.ts` | RAF-throttled pointer position ref (no re-renders) |
| `useScrollProgress.ts` | Global 0–1 scroll progress (works with Lenis) |

### Libraries (`src/lib/`)

| File | Purpose |
|------|---------|
| `constants.ts` | Brand, contact, breakpoints, durations, eases, loader lines, session keys, demo video |
| `mux.ts` | Mux URL builders (`posterUrl`, `animatedPreviewUrl`, `streamUrl`), `isRealPlaybackId`, player presets |
| `motion-presets.ts` | Section reveal and modal motion variants |
| `utils.ts` | `cn`, `clamp`, `lerp`, `formatIndex`, `isBrowser` |

### Test Utilities (`src/test-utils/`)

| File | Purpose |
|------|---------|
| `render.tsx` | Custom render function with providers |
| `fixtures.ts` | Test project fixtures (real and placeholder playback IDs) |
| `mocks.ts` | Global mocks for matchMedia, ResizeObserver, IntersectionObserver, GSAP, Mux |

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | React Compiler, `images.remotePatterns` for `image.mux.com` |
| `tsconfig.json` | Strict TypeScript, `@/*` path alias to `./src/*` |
| `vitest.config.ts` | Vitest with jsdom, path aliases, coverage thresholds |
| `vitest.setup.ts` | Testing Library jest-dom matchers, global mocks |
| `playwright.config.ts` | Playwright with `webServer`, Chromium, reduced-motion project |
| `eslint.config.mjs` | `eslint-config-next` (core-web-vitals + typescript) |
| `postcss.config.mjs` | `@tailwindcss/postcss` plugin |

## End-to-End Tests (`frontend/e2e/`)

| File | Purpose |
|------|---------|
| `home.spec.ts` | Page load, section headings, hero presence |
| `loader.spec.ts` | Loader appears on first visit, skipped on repeat |
| `project-modal.spec.ts` | Open modal, Escape closes, focus returns |
| `navigation.spec.ts` | In-page anchor links scroll to sections |
| `accessibility.spec.ts` | axe-core scan, tab order, reduced-motion behavior |

## Related Documentation

- [Architecture](architecture.md) — System design and data flow
- [Content Management](content-management.md) — How to edit the data files
- [Testing](testing.md) — How to run and write tests
