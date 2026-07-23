# Project Structure

A file-by-file map of the Goose Productions portfolio source code.

**Last verified against:** Next.js 16.2.9 (Part 4)

## Repository Layout

```
portfolio/
├── docs/                    # Documentation
├── scripts/ingest/          # Drive → Mux CLI
├── frontend/                # Next.js application
│   ├── src/
│   ├── e2e/                 # Playwright e2e
│   ├── public/
│   └── package.json
└── README.md
```

## App Router (`frontend/src/app/`)

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout — fonts, metadata, `ExperienceShell` |
| `page.tsx` | Home — Hero → About → Process → FeaturedWork → StudioProof → Services → InvestmentNote → HomeContactCta |
| `films/page.tsx` | Films archive |
| `films/[slug]/page.tsx` | Film detail (SSG) + metadata |
| `films/[slug]/opengraph-image.tsx` | Branded per-film OG image |
| `films/opengraph-image.tsx` | Films index OG |
| `opengraph-image.tsx` | Home OG |
| `contact/page.tsx` | Contact inquiry |
| `privacy/page.tsx` | Privacy |
| `api/contact/route.ts` | Contact API |
| `globals.css` | Tokens, grain, cursor, typography |
| `sitemap.ts` / `robots.ts` | SEO |

## Experience (`src/components/experience/`)

| File | Purpose |
|------|---------|
| `ExperienceShell.tsx` | Mode-aware shell (`cinematic` \| `light`) |
| `SmoothScroll.tsx` | Lenis + GSAP ticker (cinematic; dynamic `import('lenis')`) |
| `PathScrollReset.tsx` | Native scroll reset (light) |
| `CursorContext.tsx` | Cursor state store |
| `CustomCursor.tsx` | Cursor UI (cinematic only) |
| `CinematicLoader.tsx` | Session intro (cinematic only) |
| `TransitionManager.tsx` | **Enter-only route veil** — never `AnimatePresence` on page trees |

## Films / Showreel / Contact

| Path | Purpose |
|------|---------|
| `components/films/*` | Archive stage, film page, player, credits, adjacent nav |
| `components/showreel/ShowreelOverlay.tsx` | Fullscreen showreel dialog |
| `components/contact/*` | `ContactPageContent`, `ContactForm` (no `Contact.tsx`) |
| `components/projects/*` | Cards, modal, video preview |
| `components/sections/*` | Home sections including `StudioProof`, `InvestmentNote`, `HomeContactCta` |

## Libraries (`src/lib/`)

| File | Purpose |
|------|---------|
| `experience-mode.ts` | `getExperienceMode(pathname)` |
| `route-lifecycle.ts` | Scroll-lock clear + focus main |
| `og-poster.ts` | Mux poster → PNG data URL for OG |
| `scroll-layout.ts` | Lenis ↔ ScrollTrigger bridge |
| `cinematic-capabilities.ts` | Ambient video / scrub gates |
| `projects.ts` | Film paths, static params, adjacent films |
| `constants.ts` | Brand, showreel, loader lines, site URL |
| `mux.ts` | Poster / preview / stream URLs |

## End-to-End Tests (`frontend/e2e/`)

| File | Purpose |
|------|---------|
| `home.spec.ts` | Home sections, skip link, 404 |
| `loader.spec.ts` | Loader focus trap |
| `hero.spec.ts` | Desktop audio toggle |
| `project-modal.spec.ts` | Modal open/close, adjacent, legacy redirect |
| `navigation.spec.ts` | Desktop + mobile nav → contact |
| `accessibility.spec.ts` | axe + contrast + reduced motion |
| `responsive.spec.ts` | Overflow, nav, film/showreel viewports |
| `scroll-reliability.spec.ts` | Process scrub + contact↔home |
| `films.spec.ts` | Archive, filters, modal, legacy redirect |
| `films-slug.spec.ts` | Film pages + adjacent + 404 |
| `contact.spec.ts` | Mailto, expectations, form submit |
| `showreel.spec.ts` | Open/close from hero + films |
| `mobile-cinematic.spec.ts` | Mobile ambient + process pin |
| `experience-shell.spec.ts` | Light/cinematic modes, OG JPEG, scroll-lock cleanup |
| `visual.spec.ts` | Screenshot baselines (home + modal) |

## Related Documentation

- [Architecture](architecture.md)
- [Experience](experience.md)
- [Testing](testing.md)
