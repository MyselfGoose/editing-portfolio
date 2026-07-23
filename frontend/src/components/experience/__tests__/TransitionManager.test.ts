import { describe, expect, it } from "vitest";

import { resetRouteVeil } from "@/components/experience/TransitionManager";

describe("resetRouteVeil", () => {
  it("forces opacity 0 and aria-hidden true", () => {
    const veil = document.createElement("div");
    veil.style.opacity = "1";
    veil.setAttribute("aria-hidden", "false");

    resetRouteVeil(veil);

    expect(veil.style.opacity).toBe("0");
    expect(veil.getAttribute("aria-hidden")).toBe("true");
  });

  it("no-ops for null", () => {
    expect(() => resetRouteVeil(null)).not.toThrow();
  });
});
