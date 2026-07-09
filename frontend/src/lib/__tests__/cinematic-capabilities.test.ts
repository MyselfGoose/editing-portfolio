import { describe, expect, it } from "vitest";

import { getCinematicCapabilities } from "@/lib/cinematic-capabilities";

describe("getCinematicCapabilities", () => {
  it("enables cinematic features when mounted, hydrated, and motion allowed", () => {
    const caps = getCinematicCapabilities({
      mounted: true,
      isHydrated: true,
      reducedMotion: false,
    });
    expect(caps.canPlayAmbientVideo).toBe(true);
    expect(caps.canUseScrollScrub).toBe(true);
  });

  it("disables cinematic features before mount", () => {
    const caps = getCinematicCapabilities({
      mounted: false,
      isHydrated: true,
      reducedMotion: false,
    });
    expect(caps.canPlayAmbientVideo).toBe(false);
    expect(caps.canUseScrollScrub).toBe(false);
  });

  it("disables cinematic features before hydration", () => {
    const caps = getCinematicCapabilities({
      mounted: true,
      isHydrated: false,
      reducedMotion: false,
    });
    expect(caps.canPlayAmbientVideo).toBe(false);
    expect(caps.canUseScrollScrub).toBe(false);
  });

  it("disables cinematic features when reduced motion is preferred", () => {
    const caps = getCinematicCapabilities({
      mounted: true,
      isHydrated: true,
      reducedMotion: true,
    });
    expect(caps.canPlayAmbientVideo).toBe(false);
    expect(caps.canUseScrollScrub).toBe(false);
  });
});
