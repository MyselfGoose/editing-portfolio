import { describe, expect, it } from "vitest";

import { projects } from "@/data/projects";
import { getProjectById, isValidProjectId } from "@/lib/projects";

describe("getProjectById", () => {
  it("returns project for valid id", () => {
    const project = getProjectById("carezza-leanne");
    expect(project).not.toBeNull();
    expect(project?.title).toBe("Carezza Leanne");
  });

  it("returns null for invalid id", () => {
    expect(getProjectById("not-a-real-project")).toBeNull();
    expect(getProjectById("")).toBeNull();
  });

  it("validates ids against projects list", () => {
    expect(isValidProjectId(projects[0].id)).toBe(true);
    expect(isValidProjectId("fake")).toBe(false);
  });
});
