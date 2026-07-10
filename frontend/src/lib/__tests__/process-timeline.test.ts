import { describe, expect, it } from "vitest";

import { activeIndexFromTimelineProgress } from "@/lib/process-timeline";

describe("activeIndexFromTimelineProgress", () => {
  const frameCount = 3;
  const timelineDuration = 3;

  it("maps early scrub progress to the first frame", () => {
    expect(activeIndexFromTimelineProgress(0, frameCount, timelineDuration)).toBe(
      0,
    );
    expect(
      activeIndexFromTimelineProgress(0.2, frameCount, timelineDuration),
    ).toBe(0);
  });

  it("maps mid scrub progress to the second frame after crossfade", () => {
    expect(
      activeIndexFromTimelineProgress(0.5, frameCount, timelineDuration),
    ).toBe(1);
    expect(
      activeIndexFromTimelineProgress(0.66, frameCount, timelineDuration),
    ).toBe(1);
  });

  it("maps late scrub progress to the final frame", () => {
    expect(activeIndexFromTimelineProgress(1, frameCount, timelineDuration)).toBe(
      2,
    );
  });
});
