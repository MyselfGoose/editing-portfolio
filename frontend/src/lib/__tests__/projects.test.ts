import { describe, expect, it } from "vitest";

import { projects, FEATURED_PROJECT_IDS } from "@/data/projects";
import {
  getAdjacentFilms,
  getAllFilms,
  getFilmCategories,
  getFilmsByCategory,
  getFilmYearRange,
  getProjectById,
  isValidProjectId,
} from "@/lib/projects";

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

  it("keeps caption path convention for configured tracks", () => {
    const allTracks = projects.flatMap((project) => project.video.captions ?? []);
    expect(allTracks.length).toBeGreaterThan(0);
    for (const track of allTracks) {
      expect(track.src.startsWith("/captions/")).toBe(true);
      expect(track.src.endsWith(".vtt")).toBe(true);
    }
  });
});

describe("getAllFilms", () => {
  it("returns the full projects array", () => {
    const films = getAllFilms();
    expect(films).toBe(projects);
    expect(films.length).toBe(10);
  });
});

describe("getFilmCategories", () => {
  it("returns unique categories with counts", () => {
    const categories = getFilmCategories();
    expect(categories.length).toBeGreaterThan(0);
    const totalCount = categories.reduce((sum, c) => sum + c.count, 0);
    expect(totalCount).toBe(projects.length);
  });

  it("each category has at least one film", () => {
    for (const { count } of getFilmCategories()) {
      expect(count).toBeGreaterThan(0);
    }
  });
});

describe("getFilmsByCategory", () => {
  it("returns all films when category is null", () => {
    expect(getFilmsByCategory(null).length).toBe(projects.length);
  });

  it("filters by Wedding Film", () => {
    const weddings = getFilmsByCategory("Wedding Film");
    expect(weddings.length).toBeGreaterThan(0);
    for (const film of weddings) {
      expect(film.category).toBe("Wedding Film");
    }
  });

  it("returns empty array for category with no films", () => {
    const musicVideos = getFilmsByCategory("Music Video");
    expect(musicVideos.length).toBe(0);
  });
});

describe("getFilmYearRange", () => {
  it("returns earliest and latest years", () => {
    const { earliest, latest } = getFilmYearRange();
    expect(earliest).toBeLessThanOrEqual(latest);
    expect(earliest).toBeGreaterThan(2000);
    expect(latest).toBeLessThanOrEqual(new Date().getFullYear() + 1);
  });
});

describe("getAdjacentFilms", () => {
  it("returns null prev for first film", () => {
    const { prev, next } = getAdjacentFilms(projects[0].id);
    expect(prev).toBeNull();
    expect(next).not.toBeNull();
  });

  it("returns null next for last film", () => {
    const last = projects[projects.length - 1];
    const { prev, next } = getAdjacentFilms(last.id);
    expect(prev).not.toBeNull();
    expect(next).toBeNull();
  });

  it("returns both for middle film", () => {
    const middle = projects[Math.floor(projects.length / 2)];
    const { prev, next } = getAdjacentFilms(middle.id);
    expect(prev).not.toBeNull();
    expect(next).not.toBeNull();
  });

  it("returns null for invalid id", () => {
    const { prev, next } = getAdjacentFilms("does-not-exist");
    expect(prev).toBeNull();
    expect(next).toBeNull();
  });

  it("works with custom film list", () => {
    const subset = projects.slice(0, 3);
    const { prev, next } = getAdjacentFilms(subset[1].id, subset);
    expect(prev?.id).toBe(subset[0].id);
    expect(next?.id).toBe(subset[2].id);
  });
});

describe("FEATURED_PROJECT_IDS", () => {
  it("all featured IDs exist in projects", () => {
    for (const id of FEATURED_PROJECT_IDS) {
      expect(isValidProjectId(id)).toBe(true);
    }
  });
});
