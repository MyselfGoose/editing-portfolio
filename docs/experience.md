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

**Files:** `src/components/experience/SmoothScroll.tsx`, `src/lib/scroll-layout.ts`

Lenis smooth scroll integrated with GSAP's ticker for synchronized animation. Enabled on desktop with a fine pointer when reduced motion is off.

### How It Works

1. Lenis creates a smooth scroll instance and registers with `scroll-layout.ts`
2. GSAP's ticker calls `lenis.raf(time)` each frame
3. `ScrollTrigger.scrollerProxy` bridges Lenis scroll position to GSAP pin/scrub math
4. A `ResizeObserver` on `document.body` calls `refreshScrollLayout()` when layout height changes (dynamic sections, pin spacers)
5. On route change (`usePathname`), `resetScrollPosition()` scrolls to top and recalculates limits
6. `history.scrollRestoration` is set to `manual` to avoid browser restoring stale positions across routes

### Scroll layout API

| Function | Purpose |
|----------|---------|
| `registerLenis(lenis)` | Called by SmoothScroll when Lenis mounts/unmounts |
| `refreshScrollLayout()` | `ScrollTrigger.refresh()` + `lenis.resize()` |
| `resetScrollPosition()` | Scroll to top on route changes |

Process and other ScrollTrigger consumers should call `refreshScrollLayout()` after init/cleanup rather than calling `ScrollTrigger.refresh()` directly.

On mobile/tablet (no Lenis), a body `ResizeObserver` still refreshes ScrollTrigger when content height changes.

## Film Grain

A CSS overlay (`div.film-grain`) with an animated noise texture. Defined in `globals.css` with `aria-hidden="true"`. Purely decorative — no JavaScript.

## Transition Manager

**File:** `src/components/experience/TransitionManager.tsx`

Wraps page content in a stable wrapper for route changes. Intentionally avoids `AnimatePresence` exit animations — they conflict with GSAP pin spacers on the home page. Scroll reset on navigation is handled by `SmoothScroll` via `resetScrollPosition()`.

## Process Section (GSAP ScrollTrigger)

**File:** `src/components/sections/Process.tsx`

On all screen sizes (except `prefers-reduced-motion: reduce`), the process section uses GSAP ScrollTrigger to scrub through three edit stages. The section pins in place while visuals and copy cross-fade. Stage indicators (`activeIndex`) are derived from GSAP timeline progress via `activeIndexFromTimelineProgress()` in `src/lib/process-timeline.ts` — not a separate scroll formula. Inactive frames use `visibility: hidden` when opacity drops below 5% to prevent ghost text during crossfades.

When reduced motion is enabled, a simplified sticky/intersection layout (`ProcessReducedMotion`) is shown instead.

Scroll-pin uses `ignoreMobileResize` for iOS address-bar stability and `--nav-offset` padding to clear fixed navigation.

## Related Documentation

- [Architecture](architecture.md) — Rendering model and client boundary
- [Accessibility](accessibility.md) — Reduced motion handling
- [Troubleshooting](troubleshooting.md) — Loader and scroll issues
