# Experience Systems

The cinematic experience layer — loader, custom cursor, smooth scroll, film grain, and page transitions.

**Last verified against:** Next.js 16.2.9

## Overview

All experience systems are mounted through a single client boundary in `ExperienceShell`. They wrap the page content and provide the polished, cinematic feel of the portfolio.

```
ExperienceShell
  ├── SmoothScroll        (Lenis + GSAP ticker)
  ├── CursorProvider      (state store)
  ├── CustomCursor        (ring + dot + label)
  ├── CinematicLoader     (session one-shot overlay)
  ├── film-grain          (CSS overlay)
  └── TransitionManager   (route change animations)
        └── page content
```

## Cinematic Loader

**File:** `src/components/experience/CinematicLoader.tsx`

A full-screen intro overlay that plays once per browser tab session.

### Behavior

1. On first visit, the loader displays status lines with animated counters, then reveals the brand name
2. After the GSAP timeline completes, the loader sets `sessionStorage` key `gp:loader-played` to `"1"` and unmounts
3. On subsequent visits in the same tab, the loader is skipped entirely
4. With `prefers-reduced-motion: reduce`, the loader shows briefly (400ms) then dismisses

### Session Key

```typescript
// frontend/src/lib/constants.ts
export const SESSION_KEYS = {
  loaderPlayed: "gp:loader-played",
} as const;
```

To replay the loader during development, clear session storage in DevTools:

```javascript
sessionStorage.removeItem("gp:loader-played");
```

Then refresh the page.

### Loader Lines

Status lines are defined in `constants.ts`:

```typescript
export const LOADER_LINES = [
  { label: "INITIALIZING VISUAL SYSTEM", status: "READY" },
  { label: "COLOR GRADING", status: "DONE" },
  { label: "FRAME ANALYSIS", status: "DONE" },
  { label: "STORY ENGINE", status: "READY" },
] as const;
```

### Timing

| Setting | Desktop | Mobile |
|---------|---------|--------|
| Total duration | 2600ms | 1500ms (scaled) |
| Outro wipe | 600ms | 600ms (scaled) |

## Custom Cursor

**Files:** `CursorContext.tsx`, `CustomCursor.tsx`

A custom cursor ring with dot and label that replaces the default pointer on fine-pointer devices.

### Cursor States

| State | Trigger | Appearance |
|-------|---------|------------|
| `default` | Normal hover | Small ring + dot |
| `play` | Hover over video preview | Ring expands, "PLAY" label |
| `open` | Hover over links/CTAs | Ring expands, "OPEN" label |

### Behavior

- Hidden on touch devices (`pointer: coarse`) and when `prefers-reduced-motion: reduce`
- Position tracked via RAF-throttled `useMousePosition` hook (no React re-renders)
- State set by child components via `useCursor()` context hook

## Smooth Scroll

**File:** `src/components/experience/SmoothScroll.tsx`

Lenis smooth scroll integrated with GSAP's ticker for synchronized animation.

### How It Works

1. Lenis creates a smooth scroll instance on `window`
2. GSAP's ticker calls `lenis.raf(time)` each frame
3. ScrollTrigger and other GSAP animations stay in sync with Lenis scroll position
4. `useScrollProgress` reads native `window.scrollY`, which Lenis updates under the hood

## Film Grain

A CSS overlay (`div.film-grain`) with an animated noise texture. Defined in `globals.css` with `aria-hidden="true"`. Purely decorative — no JavaScript.

## Transition Manager

**File:** `src/components/experience/TransitionManager.tsx`

Wraps page content in Motion's `AnimatePresence` for route change transitions. Currently a single-page app, but ready for future multi-page expansion.

## Process Section (GSAP ScrollTrigger)

**File:** `src/components/sections/Process.tsx`

On desktop, the process section uses GSAP ScrollTrigger to scrub through three edit stages as the user scrolls. On mobile, stages are displayed statically.

This is the most complex scroll-driven animation in the app and depends on Lenis + GSAP being initialized by `SmoothScroll`.

## Related Documentation

- [Architecture](architecture.md) — Rendering model and client boundary
- [Accessibility](accessibility.md) — Reduced motion handling
- [Troubleshooting](troubleshooting.md) — Loader and scroll issues
