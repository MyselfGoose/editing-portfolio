import { describe, expect, it } from "vitest";

import { usePageVisibility } from "@/hooks/usePageVisibility";

describe("usePageVisibility", () => {
  it("exports a hook function", () => {
    expect(typeof usePageVisibility).toBe("function");
  });
});
