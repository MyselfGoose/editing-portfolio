import { describe, expect, it } from "vitest";

import {
  clamp,
  cn,
  formatIndex,
  isBrowser,
  lerp,
} from "@/lib/utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns empty string when all values are falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("clamp", () => {
  it("clamps value within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("returns min when value is NaN", () => {
    expect(clamp(NaN, 0, 10)).toBe(0);
  });
});

describe("lerp", () => {
  it("interpolates between two values", () => {
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 1)).toBe(100);
    expect(lerp(0, 100, 0.5)).toBe(50);
  });
});

describe("formatIndex", () => {
  it("pads index with leading zeros", () => {
    expect(formatIndex(1)).toBe("01");
    expect(formatIndex(10)).toBe("10");
    expect(formatIndex(1, 3)).toBe("001");
  });
});

describe("isBrowser", () => {
  it("returns true in jsdom environment", () => {
    expect(isBrowser()).toBe(true);
  });
});
