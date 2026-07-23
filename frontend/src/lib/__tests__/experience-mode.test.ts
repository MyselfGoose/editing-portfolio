import { describe, expect, it } from "vitest";

import { getExperienceMode, isCinematicMode } from "@/lib/experience-mode";

describe("getExperienceMode", () => {
  it("marks home and films routes cinematic", () => {
    expect(getExperienceMode("/")).toBe("cinematic");
    expect(getExperienceMode("/films")).toBe("cinematic");
    expect(getExperienceMode("/films/carezza-leanne")).toBe("cinematic");
    expect(getExperienceMode("/films/foo/bar")).toBe("cinematic");
  });

  it("marks contact, privacy, and unknown routes light", () => {
    expect(getExperienceMode("/contact")).toBe("light");
    expect(getExperienceMode("/privacy")).toBe("light");
    expect(getExperienceMode("/not-a-route")).toBe("light");
    expect(getExperienceMode("")).toBe("light");
  });

  it("exposes isCinematicMode helper", () => {
    expect(isCinematicMode("/")).toBe(true);
    expect(isCinematicMode("/contact")).toBe(false);
  });
});
