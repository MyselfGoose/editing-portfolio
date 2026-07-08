# Testing

How to run, write, and debug tests for the Goose Productions portfolio.

**Last verified against:** Next.js 16.2.9

## Overview

The test suite has three layers:

| Layer | Tool | What It Tests |
|-------|------|---------------|
| Unit | Vitest | Pure functions (`utils.ts`, `mux.ts`), data contracts (`projects.ts`) |
| Component | Vitest + Testing Library | React components, hooks, user interactions |
| E2E | Playwright | Full browser flows, accessibility, keyboard navigation |

No screenshot or visual regression tests are included. Animation-heavy shell components are covered by e2e tests rather than unit tests.

## Commands

All commands run from the `frontend/` directory:

```bash
npm run test              # Run unit and component tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:e2e          # Run Playwright end-to-end tests
npm run test:e2e:ui       # Run Playwright with interactive UI
npm run check             # Lint + typecheck + test + build
```

### First-Time E2E Setup

Playwright downloads Chromium on first run:

```bash
npx playwright install chromium
```

For CI (includes system dependencies):

```bash
npx playwright install --with-deps chromium
```

## Test Structure

```
frontend/
├── src/
│   ├── lib/__tests__/           # Unit tests for utilities and Mux helpers
│   ├── data/__tests__/          # Data contract tests
│   ├── hooks/__tests__/         # Hook behavior tests
│   ├── components/
│   │   ├── projects/__tests__/  # Project card, modal, video preview
│   │   ├── sections/__tests__/  # Featured work, contact, hero audio
│   │   └── experience/__tests__/ # Loader, custom cursor
│   └── test-utils/              # Shared fixtures, mocks, render helpers
└── e2e/
    ├── home.spec.ts             # Page load, sections, skip link
    ├── loader.spec.ts           # Cinematic loader session behavior
    ├── project-modal.spec.ts    # Modal open/close, focus management
    ├── navigation.spec.ts       # Hash navigation, project listing
    └── accessibility.spec.ts    # axe-core scan, tab order, reduced motion
```

## Coverage Targets

Coverage is enforced in CI via Vitest thresholds. Animation-heavy components excluded from unit coverage (tested via e2e):

| Area | Target | Notes |
|------|--------|-------|
| `src/lib/**` | ≥ 90% lines | `mux.ts`, `utils.ts` fully tested |
| `src/data/**` | 100% | Contract tests for all projects |
| `src/hooks/**` | ≥ 80% | All five hooks tested |
| `src/components/**` | ≥ 70% | Shell/animation sections excluded |
| Overall | ≥ 75% lines | Enforced in `vitest.config.ts` |

Excluded from unit coverage (covered by e2e):

- `ExperienceShell`, `SmoothScroll`, `TransitionManager`
- `Hero`, `HeroBackdrop`, `HeroPlayerBoundary`
- `Process`, `About`, `Services`

Run coverage locally:

```bash
npm run test:coverage
```

## Mocking Strategy

Global mocks are configured in `vitest.setup.ts` and `src/test-utils/mocks.tsx`:

| Dependency | Mock Behavior |
|------------|---------------|
| `@mux/mux-player-react` | Renders `<div data-testid="mux-player" />` |
| `gsap` / `@gsap/react` | No-op timeline; `useGSAP` runs callback immediately |
| `motion/react` | Renders plain HTML elements without animation |
| `next/dynamic` | Returns synchronous component (FeaturedWork tests) |
| `matchMedia` | Configurable via `mockMatchMedia()` / `mockMatchMediaForQuery()` |
| `IntersectionObserver` | Auto-triggers `isIntersecting: true` on observe |
| `ResizeObserver` | No-op stub |
| `requestAnimationFrame` | Queues callbacks without synchronous invocation |

### Test Fixtures

`src/test-utils/fixtures.ts` provides:

- `testProject` — project with real Mux playback ID
- `placeholderProject` — project with `[PLAYBACK_ID_01]` placeholder
- `projectWithCaptions` — project with VTT caption tracks

### Render Helpers

`renderWithProviders()` wraps components in `CursorProvider` for tests that need cursor context.

## What Each Layer Covers

### Unit Tests

- **`mux.ts`** — `isRealPlaybackId`, URL builders, option clamping, empty ID errors
- **`utils.ts`** — `cn`, `clamp`, `lerp`, `formatIndex`, `isBrowser`
- **`projects.ts`** — Unique IDs, valid fields, preview range bounds, caption tracks

### Component Tests

- **`ProjectCard`** — Title/category rendering, Coming Soon state, click handler
- **`ProjectModal`** — Metadata display, Mux player, Escape close, focus trap, body overflow
- **`VideoPreview`** — Poster URL, placeholder state, click/keyboard open
- **`FeaturedWork`** — All projects rendered, modal opens on click
- **`Contact`** — Mailto links, credits, footer
- **`CinematicLoader`** — First visit display, session skip, reduced motion dismiss
- **`HeroAudioToggle`** — Muted default, toggle aria-pressed
- **`CustomCursor`** — Visible on fine pointer, hidden on reduced motion / coarse pointer

### E2E Tests

- **Home** — All sections present, skip link works
- **Loader** — Plays on first visit, skipped on repeat
- **Project modal** — Open from work section, Escape/close button dismisses, focus returns
- **Navigation** — Hash URLs reveal sections, all projects listed
- **Accessibility** — No critical axe violations, tab order to modal close, reduced motion loader

## CI Pipeline

GitHub Actions runs on every push and pull request to `main`/`master`:

![CI](https://github.com/MyselfGoose/editing-portfolio/actions/workflows/ci.yml/badge.svg)

| Job | Command | Purpose |
|-----|---------|---------|
| Lint | `npm run lint` | ESLint |
| Typecheck | `npm run typecheck` | TypeScript strict check |
| Unit | `npm run test:coverage` | Vitest with coverage thresholds |
| Build | `npm run build` | Production build |
| E2E | `npm run test:e2e` | Playwright (after unit + build pass) |

Workflow file: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

Playwright reports are uploaded as artifacts on failure.

## Writing New Tests

### Unit Test

```typescript
// src/lib/__tests__/myModule.test.ts
import { describe, expect, it } from "vitest";
import { myFunction } from "@/lib/myModule";

describe("myFunction", () => {
  it("handles the expected case", () => {
    expect(myFunction("input")).toBe("output");
  });
});
```

### Component Test

```typescript
// src/components/foo/__tests__/Foo.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Foo } from "@/components/foo/Foo";

describe("Foo", () => {
  it("responds to click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Foo onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### E2E Test

```typescript
// e2e/my-flow.spec.ts
import { expect, test } from "@playwright/test";

test("my user flow", async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("gp:loader-played", "1");
  });
  await page.goto("/");
  await expect(page.locator("#hero")).toBeVisible();
});
```

Skip the cinematic loader in e2e tests by setting `gp:loader-played` in sessionStorage before navigation.

## Troubleshooting Tests

See [Troubleshooting](troubleshooting.md#testing) for common test failures.

## Related Documentation

- [Getting Started](getting-started.md) — Prerequisites and scripts
- [Project Structure](project-structure.md) — Test file locations
- [Accessibility](accessibility.md) — A11y patterns tested in e2e
