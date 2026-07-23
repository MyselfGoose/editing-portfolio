# Responsive Design

How the Goose Productions portfolio adapts across devices — breakpoint tiers, layout primitives, animation policy, and video behavior.

**Last verified against:** Next.js 16.2.9

## Device tiers

| Tier | Viewport | Experience |
|------|----------|------------|
| **Mobile** | `< 768px` | Native scroll, ambient hero video, scroll-pin Process, stacked layouts, mobile nav |
| **Tablet** | `768px – 1023px` | Balanced cinematic: ambient hero video, scroll-pin Process, simplified motion |
| **Desktop** | `≥ 1024px` + fine pointer | Full immersive: Lenis scroll, custom cursor, hover previews, hero video |

Tier detection lives in [`frontend/src/lib/breakpoints.ts`](../frontend/src/lib/breakpoints.ts) and [`BreakpointProvider`](../frontend/src/components/providers/BreakpointProvider.tsx).

## Breakpoint values

| Token | Width |
|-------|-------|
| `xs` | 320px |
| `sm` | 390px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1440px |
| `2xl` | 1920px |

CSS layout tokens in [`globals.css`](../frontend/src/app/globals.css):

- `--section-px` — horizontal padding (`clamp(1.25rem, 4vw, 2.5rem)`)
- `--section-py` — vertical section padding
- `--container-max` — content max-width (1440px / 90rem)

## Layout primitives

| Component | Path | Purpose |
|-----------|------|---------|
| `Container` | `components/layout/Container.tsx` | Max-width content wrapper |
| `Section` | `components/layout/Section.tsx` | Consistent section padding and borders |
| `SectionHeader` | `components/layout/SectionHeader.tsx` | Eyebrow + aside label pattern |
| `Stack` | `components/layout/Stack.tsx` | Vertical rhythm |
| `MediaFrame` | `components/layout/MediaFrame.tsx` | Aspect-ratio media wrapper |

## Typography

Fluid utility classes in `globals.css`:

| Class | Use |
|-------|-----|
| `text-massive` | Hero and contact headlines |
| `text-headline` | Section titles |
| `text-eyebrow` | Section labels and metadata (12–14px) |
| `text-nav` | Navigation links (13–15px) |
| `text-meta` | Secondary metadata lines (12–13px) |
| `text-cta` | Contact call-to-action |
| `text-chapter` | Services chapter titles |
| `text-body-lg` | Body copy |
| `text-balance` | Balanced line wrapping |

## Animation policy

Configured in [`motion-presets.ts`](../frontend/src/lib/motion-presets.ts) and [`ExperienceShell`](../frontend/src/components/experience/ExperienceShell.tsx):

| System | Mobile | Desktop | Light routes (`/contact`, `/privacy`) |
|--------|--------|---------|----------------------------------------|
| Lenis smooth scroll | Off | On (fine pointer only) | Never |
| Custom cursor UI | Off | On (cinematic) | Never |
| Process ScrollTrigger | On (home cinematic) | On | N/A |
| Film grain | Static overlay | Animated | Never |
| Cinematic loader | Session (cinematic entry) | Session | Never |
| Route veil | Short | Longer cinematic↔cinematic | Short light↔cinematic |

`MotionConfig reducedMotion="user"` respects OS reduced-motion preference globally.

## Video policy

| Surface | Mobile / Tablet | Desktop |
|---------|-----------------|---------|
| Hero ambient | Mux HLS (muted autoplay, 720p cap) | Mux HLS (1080p cap) |
| Showreel overlay | Cinematic mobile preset | Cinematic preset |
| Film page player | Film page Mux player | Same |
| Project previews | Poster only | Poster + animated WebP on hover |
| Modal player | 1080p max | 2160p cinematic |

## Film page + showreel

- `/films/[slug]` must avoid horizontal overflow at 390 / 768 / 1024 (covered by `responsive.spec.ts`).
- Showreel dialog respects safe-area insets; custom cursor is never required.
- Light shell contact/privacy keep SiteNav/DesktopNav with identical IA.

## Mobile navigation

[`SiteNav`](../frontend/src/components/navigation/SiteNav.tsx) provides a fullscreen menu below 1024px with links to Home, Films, Contact. Focus trap, Escape to close, closes on pathname change.

## Testing responsive behavior

```bash
cd frontend
npm run test:e2e -- e2e/responsive.spec.ts
```

Playwright viewports tested: 320px, 375px, 1024px.

Unit tests for breakpoint logic:

```bash
npm run test -- src/lib/__tests__/breakpoints.test.ts
```

## Related documentation

- [Architecture](architecture.md)
- [Experience](experience.md)
- [Accessibility](accessibility.md)
- [Testing](testing.md)
- [Responsive review](responsive-review.md)
