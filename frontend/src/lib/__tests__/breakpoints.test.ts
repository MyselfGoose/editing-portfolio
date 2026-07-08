import { describe, expect, it } from "vitest";

import {
  BREAKPOINTS,
  posterWidthForTier,
  previewWidthForTier,
  tierFromWidth,
} from "@/lib/breakpoints";

describe("breakpoints", () => {
  it("maps width to device tier", () => {
    expect(tierFromWidth(320)).toBe("mobile");
    expect(tierFromWidth(767)).toBe("mobile");
    expect(tierFromWidth(768)).toBe("tablet");
    expect(tierFromWidth(1023)).toBe("tablet");
    expect(tierFromWidth(1024)).toBe("desktop");
    expect(tierFromWidth(1920)).toBe("desktop");
  });

  it("returns tier-appropriate poster widths", () => {
    expect(posterWidthForTier("mobile")).toBe(640);
    expect(posterWidthForTier("tablet")).toBe(960);
    expect(posterWidthForTier("desktop")).toBe(1280);
  });

  it("returns tier-appropriate preview widths", () => {
    expect(previewWidthForTier("mobile")).toBe(640);
    expect(previewWidthForTier("tablet")).toBe(960);
    expect(previewWidthForTier("desktop")).toBe(1280);
  });

  it("exposes canonical breakpoint values", () => {
    expect(BREAKPOINTS.md).toBe(768);
    expect(BREAKPOINTS.lg).toBe(1024);
  });
});
