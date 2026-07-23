# Experience Systems

The cinematic experience layer — loader, custom cursor, smooth scroll, film grain, and route transitions.

**Last verified against:** Next.js 16.2.9 (Part 4)

## Overview

`ExperienceShell` is the single client boundary. It classifies routes with `getExperienceMode(pathname)` and mounts chrome accordingly. Nav and `CursorProvider` stay mounted across mode switches.

```
ExperienceShell
  ├── SmoothScroll | PathScrollReset   (mode-gated, effect-only)
  ├── CursorProvider
  │     ├── SiteNav / DesktopNav
  │     ├── CustomCursor               (cinematic only)
  │     ├── CinematicLoader            (cinematic only)
  │     ├── film-grain                 (cinematic only)
  │     └── TransitionManager          (enter-veil)
  │           └── page content
```

| Mode | Pathnames | Behavior |
|------|-----------|----------|
| cinematic | `/`, `/films`, `/films/*` | Lenis (desktop + fine pointer + motion), cursor UI, session loader, grain |
| light | `/contact`, `/privacy`, other | Native scroll via `PathScrollReset`; no Lenis / cursor UI / loader / grain |

HTML attribute: `data-experience-mode="cinematic|light"`.

## Cinematic Loader

**File:** `src/components/experience/CinematicLoader.tsx`

Plays once per tab session on **cinematic** routes (not mounted on light).

Session key: `SESSION_KEYS.loaderPlayed` → `"gp:loader-played"`.

### Loader Lines

From `constants.ts`:

```typescript
export const LOADER_LINES = [
  { label: "LOADING SELECTS", status: "READY" },
  { label: "CALIBRATING GRADE", status: "DONE" },
  { label: "LOCKING PICTURE", status: "DONE" },
  { label: "SETTING MOOD", status: "READY" },
] as const;
```

| Setting | Desktop | Mobile |
|---------|---------|--------|
| Total duration | 2600ms | 1500ms |
| Outro wipe | 600ms | 600ms |

## Custom Cursor

Mounted only in cinematic mode. `useCursor()` soft-falls back when the provider is absent (provider remains mounted on light for Contact mailto hover labels — state is unused without `CustomCursor`).

## Smooth Scroll / Path Scroll

- **Cinematic:** `SmoothScroll` dynamically imports Lenis; GSAP ticker + `ScrollTrigger.scrollerProxy`; capability gate: desktop + fine pointer + `!reducedMotion`.
- **Light:** `PathScrollReset` — native scroll + `resetScrollPosition` on pathname change; no Lenis module init.

`scroll-layout.ts` API: `registerLenis`, `refreshScrollLayout`, `resetScrollPosition`.

## Film Grain

CSS `.film-grain` overlay — cinematic routes only.

## Transition Manager (GSAP-safe)

**File:** `src/components/experience/TransitionManager.tsx`

**Decision:** Enter-only fixed veil overlay. Page trees swap synchronously (Next soft nav). **Never** wrap pages in `AnimatePresence` exit animations — those fight GSAP ScrollTrigger pin spacers on Home Process and cause React `removeChild` errors.

On pathname change the veil:

1. Clears scroll-lock artifacts (`body.overflow`, `dataset.scrollLocked`)
2. Focuses `#main`
3. Fades a sibling overlay (durations: reduced-motion ~60ms; light↔cinematic ~120ms; mobile cinematic ~160ms; desktop cinematic↔cinematic ~280ms)

Showreel and ProjectModal are **overlays**, not route transitions.

## Process Section

`Process.tsx` — GSAP pin + scrub on home only. Couples to Lenis only through document `scrollerProxy`. Returning Home from a light route remounts Process after cinematic `SmoothScroll` reinits — covered by `scroll-reliability` e2e.

## Related Documentation

- [Architecture](architecture.md)
- [Accessibility](accessibility.md)
- [Roadmap Decisions](roadmap-decisions.md)
