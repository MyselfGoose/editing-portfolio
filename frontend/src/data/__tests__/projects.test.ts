import { describe, expect, it } from "vitest";

import { projects, type ProjectVideo } from "@/data/projects";
import { isRealPlaybackId, type VideoAspectRatio } from "@/lib/mux";

const VALID_ASPECT_RATIOS: ReadonlyArray<VideoAspectRatio> = ["16/9", "9/16", "4/3"];

describe("projects data contract", () => {
  it("has four featured projects", () => {
    expect(projects.length).toBe(4);
  });

  it("has unique project IDs", () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique project indices", () => {
    const indices = projects.map((p) => p.index);
    expect(new Set(indices).size).toBe(indices.length);
  });

  it.each(projects.map((p) => [p.id, p] as const))(
    "project %s has valid required fields",
    (_id, project) => {
      expect(project.id).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(project.location).toBeTruthy();
      expect(project.year).toBeGreaterThan(0);
      expect(project.index).toBeGreaterThan(0);
      expect(project.credits.role).toBeTruthy();
      expect(project.credits.client).toBeTruthy();
    },
  );

  it.each(projects.map((p) => [p.id, p.video] as const))(
    "project %s video has valid playback ID and aspect ratio",
    (_id, video: ProjectVideo) => {
      expect(video.playbackId).toBeTruthy();
      expect(VALID_ASPECT_RATIOS).toContain(video.aspectRatio);
      expect(video.duration).toBeTruthy();
    },
  );

  it.each(
    projects
      .filter((p) => p.video.previewRange !== undefined)
      .map((p) => [p.id, p.video.previewRange!] as const),
  )("project %s previewRange end > start", (_id, range) => {
    expect(range.end).toBeGreaterThan(range.start);
  });

  it.each(
    projects
      .filter((p) => p.video.captions !== undefined)
      .flatMap((p) =>
        (p.video.captions ?? []).map(
          (track) => [p.id, track] as const,
        ),
      ),
  )("project %s caption track has required fields", (_id, track) => {
    expect(track.src).toBeTruthy();
    expect(track.srcLang).toBeTruthy();
    expect(track.label).toBeTruthy();
  });

  it("all projects currently use real or placeholder playback IDs consistently", () => {
    for (const project of projects) {
      const id = project.video.playbackId;
      const isReal = isRealPlaybackId(id);
      const isPlaceholder = /^\[.+\]$/.test(id.trim());
      expect(isReal || isPlaceholder).toBe(true);
    }
  });
});
