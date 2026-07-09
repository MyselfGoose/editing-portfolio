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
| `text-eyebrow` | Labels and metadata |
| `text-cta` | Contact call-to-action |
| `text-chapter` | Services chapter titles |
| `text-body-lg` | Body copy |
| `text-balance` | Balanced line wrapping |

## Animation policy

Configured in [`motion-presets.ts`](../frontend/src/lib/motion-presets.ts) and [`ExperienceShell`](../frontend/src/components/experience/ExperienceShell.tsx):

| System | Mobile | Desktop |
|--------|--------|---------|
| Lenis smooth scroll | Off | On (fine pointer only) |
| Custom cursor | Off | On |
| Process ScrollTrigger | On (all tiers; reduced-motion fallback) | On (Lenis-synced when available) |
| Motion reveals | Shorter, smaller offset | Full cinematic |
| Hero word mask | Fade only | Masked stagger |
| Film grain animation | Static overlay | Animated |

`MotionConfig reducedMotion="user"` respects OS reduced-motion preference globally.

## Video policy

| Surface | Mobile / Tablet | Desktop |
|---------|-----------------|---------|
| Hero | MuxVideo HLS (muted autoplay, 720p cap on mobile) | MuxVideo HLS (muted autoplay, 1080p cap) |
| Project previews | Poster only | Poster + animated WebP on hover |
| Modal player | 1080p max preset | 2160p cinematic preset |

Mux image widths scale by tier via `posterWidthForTier()` and `previewWidthForTier()`.

## Mobile navigation

[`SiteNav`](../frontend/src/components/navigation/SiteNav.tsx) provides a fullscreen menu below 1024px with links to all sections. Includes focus trap, Escape to close, and smooth scroll to anchors.

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
