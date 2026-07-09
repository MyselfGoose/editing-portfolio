# Accessibility

Reduced motion support, keyboard navigation, focus management, and semantic HTML patterns used throughout the portfolio.

**Last verified against:** Next.js 16.2.9

## Overview

The portfolio is designed to be usable with keyboard-only navigation and respects the user's motion preferences. Key accessibility features are built into the experience layer and individual components.

## Reduced Motion

The `usePrefersReducedMotion` hook wraps `matchMedia("(prefers-reduced-motion: reduce)")` and is used throughout the app to disable or simplify animations.

### What Changes with Reduced Motion

| Feature | Normal | Reduced Motion |
|---------|--------|----------------|
| Cinematic loader | Full GSAP timeline (~2.6s) | Brief flash (400ms) then dismiss |
| Custom cursor | Visible ring + dot + label | Hidden entirely |
| Video hover previews | Animated WebP on hover | Static poster only |
| Section entrances | Motion fade-in on scroll | Still rendered (Motion respects OS preference) |
| Hero ambient video | MuxVideo muted autoplay (all tiers) | Static poster only |

### Testing Reduced Motion

In your browser DevTools:

1. Open Rendering tab (Chrome) or Accessibility tab (Firefox)
2. Enable "Emulate CSS media feature prefers-reduced-motion: reduce"
3. Refresh the page

Or in Playwright e2e tests, a dedicated project runs with reduced motion enabled.

## Keyboard Navigation

### Skip Link

A skip link is the first focusable element on the page:

```html
<a href="#main" class="skip-link">Skip to content</a>
```

Press Tab on page load to reveal it. Activating it jumps focus to the main content area.

### Video Previews

Project video previews are `<button>` elements:

- **Enter** or **Space** opens the project modal
- Placeholder projects (Coming Soon) have `tabIndex={-1}` and cannot be focused

### Project Modal

The fullscreen project modal implements a focus trap:

- **Escape** closes the modal
- **Tab** cycles through focusable elements within the modal (close button, video player)
- **Shift+Tab** cycles backward
- Focus returns to the element that opened the modal on close
- `document.body.style.overflow` is set to `hidden` while open
- Caption `<track>` elements are rendered from `projects.ts` configuration when available

### Cinematic Loader

The loader blocks background interaction while visible:

- Sets `aria-busy="true"` during playback
- Applies `inert` to `#main` and skip link while active
- Focuses the loader root and traps `Tab` navigation
- Restores focus to skip link after dismiss

Implementation in `ProjectModal.tsx`:

```typescript
// Focus trap on Tab
if (event.key === "Tab" && dialogRef.current) {
  const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
    'button, [href], video, mux-player, [tabindex]:not([tabindex="-1"])',
  );
  // ... wrap focus between first and last
}
```

### Contact Links

Contact section uses `mailto:` links with visible text labels. No JavaScript required.

## Semantic HTML

| Element | Usage |
|---------|-------|
| `<main id="main">` | Primary content landmark |
| `<section>` with `aria-labelledby` | Each page section has a heading reference |
| `<article>` | Project cards |
| `<dl>`, `<dt>`, `<dd>` | Project metadata (location, duration, role) |
| `<button>` | Video previews (not divs with onClick) |
| `role="dialog"` + `aria-modal="true"` | Project modal |
| `aria-label` | Close button, video player, video preview buttons |
| `aria-hidden="true"` | Decorative elements (film grain, poster overlays) |

## Color and Contrast

The design uses a dark theme with CSS custom properties:

- Foreground: `#f5f5f5` on background `#0a0a0a`
- Muted text: `#8a8a8a`
- Dim text: `#7a7a7a`
- High contrast ratio for body text and interactive elements

## Screen Reader Considerations

- Video poster images use `alt=""` and `aria-hidden="true"` (decorative)
- Video preview buttons have descriptive `aria-label` (e.g. "Open [THE WEDDING FILM]")
- Modal title is referenced via `aria-labelledby`
- Status text in video previews ("PREVIEW", "PLAYING", "COMING SOON") is `aria-hidden` (button label conveys state)

## Automated Testing

Accessibility is tested in two layers:

1. **Component tests** — Modal focus trap, Escape key, body overflow, focus restoration
2. **E2E tests** — axe-core scan for critical violations, tab order to modal close, reduced-motion project

See [Testing](testing.md) for commands and details.

## Related Documentation

- [Experience](experience.md) — Loader and cursor reduced-motion behavior
- [Testing](testing.md) — Accessibility test coverage
- [Troubleshooting](troubleshooting.md) — Common a11y issues
