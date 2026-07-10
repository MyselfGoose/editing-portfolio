# Troubleshooting

Common development, deployment, and runtime issues and how to resolve them.

**Last verified against:** Next.js 16.2.9

## Development

### `npm install` fails

**Symptom:** Dependency installation errors.

**Fix:**
- Ensure Node.js 20+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Dev server won't start

**Symptom:** `npm run dev` fails or port 3000 is in use.

**Fix:**
- Check if another process is using port 3000: `lsof -i :3000`
- Kill the process or use a different port: `npm run dev -- -p 3001`

### TypeScript errors after editing

**Symptom:** `npm run typecheck` reports errors.

**Fix:**
- Run `npm run typecheck` to see all errors
- Common causes: missing fields in `Project` interface, invalid `aspectRatio` value, typos in imports
- Ensure `@/*` path aliases resolve correctly (check `tsconfig.json`)

## Video Playback

### Project shows "Coming Soon"

**Symptom:** A project card displays "Coming Soon" instead of a video preview.

**Cause:** The `playbackId` is a bracketed placeholder (e.g. `[PLAYBACK_ID_01]`) or empty.

**Fix:**
1. Upload the video to Mux (see [Video Ingest](video-ingest.md))
2. Replace the placeholder with the real playback ID in `projects.ts`
3. Rebuild and redeploy

### Poster frame is blurry or wrong

**Symptom:** The still poster doesn't look good.

**Fix:** Adjust `posterTime` in the project's video config. Pick a frame with strong composition and no motion blur. Values are in seconds.

### Hover preview doesn't animate

**Symptom:** Hovering over a project card shows the static poster but no animated preview.

**Possible causes:**
1. **Reduced motion enabled** — Animated previews are disabled when `prefers-reduced-motion: reduce` is active
2. **Touch device** — Previews only animate on fine-pointer devices (`pointer: fine`)
3. **Not in viewport** — Previews load lazily via IntersectionObserver; scroll the card into view first
4. **`previewRange` too narrow** — Ensure `end - start >= 0.5` seconds

### Modal video won't play

**Symptom:** Clicking a project opens the modal but the video doesn't start.

**Fix:**
- Verify the playback ID is real (not bracketed)
- Check the Mux asset status is **ready** in the dashboard
- Ensure playback policy is **Public**
- Check browser console for CORS or network errors

## Experience Systems

### Loader plays every visit

**Symptom:** The cinematic intro overlay appears on every page load.

**Cause:** `sessionStorage` is not persisting (private browsing, storage blocked, or key cleared).

**Fix:**
- Normal behavior in private/incognito mode (sessionStorage clears on close)
- To test the skip behavior: visit once, then refresh without clearing storage
- To force replay: `sessionStorage.removeItem("gp:loader-played")` in DevTools console

### Loader hangs / never dismisses

**Symptom:** The loader overlay stays visible indefinitely.

**Possible causes:**
1. GSAP failed to initialize (check console for errors)
2. JavaScript error in the loader component

**Fix:**
- Check browser console for errors
- With reduced motion, the loader should dismiss after 400ms regardless of GSAP
- Clear sessionStorage and refresh

### Smooth scroll feels broken

**Symptom:** Scrolling is jerky or ScrollTrigger animations don't sync.

**Fix:**
- Ensure `SmoothScroll` is mounted (it's inside `ExperienceShell`)
- On desktop, GSAP ScrollTrigger syncs with Lenis via `ScrollTrigger.update`
- On mobile/tablet, native scroll calls `ScrollTrigger.update` directly — Lenis is intentionally off
- If Process pin feels stuck on iOS, try orientation change or scroll refresh; `ignoreMobileResize` is enabled
- `inferred.litix.io` CORS errors in local dev are from Mux Data beacons and are suppressed in development via `MUX_DEV_VIDEO_PROPS`

### Custom cursor not visible

**Symptom:** Default browser cursor shows instead of the custom ring.

**Expected behavior on:**
- Touch devices (no fine pointer)
- `prefers-reduced-motion: reduce` enabled
- Before hydration completes

## Testing

### Tests fail with "window is not defined"

**Symptom:** Vitest tests crash referencing `window` or `document`.

**Fix:** Ensure `vitest.config.ts` sets `environment: "jsdom"` and `vitest.setup.ts` mocks browser globals.

### Playwright e2e tests timeout

**Symptom:** E2E tests fail waiting for the dev server or elements.

**Fix:**
- Ensure port 3000 is free before running `npm run test:e2e`
- The Playwright config starts the dev server automatically via `webServer`
- Increase timeout in `playwright.config.ts` if on a slow machine

### Coverage below threshold

**Symptom:** `npm run test:coverage` fails because coverage is below configured thresholds.

**Fix:**
- Run `npm run test:coverage` and check the report for uncovered files
- Add tests for uncovered logic (see [Testing](testing.md))
- Animation-heavy components are exempt from high coverage targets

## Deployment

### Vercel build fails

**Symptom:** Deploy fails during `npm run build`.

**Fix:**
- Run `npm run build` locally to reproduce
- Common causes: TypeScript errors, missing imports, ESLint violations
- Ensure Root Directory is set to `frontend` in Vercel project settings

### Images from Mux don't load

**Symptom:** Poster frames or previews show broken images in production.

**Fix:** Verify `next.config.ts` includes `image.mux.com` in `images.remotePatterns`. Note: the site uses raw `<img>` tags for Mux animated previews (not `next/image`), so this only affects `next/image` usage.

## Related Documentation

- [Getting Started](getting-started.md) — Setup and scripts
- [Video Ingest](video-ingest.md) — Mux upload workflow
- [Experience](experience.md) — Loader, cursor, scroll behavior
- [Testing](testing.md) — Test commands and debugging
