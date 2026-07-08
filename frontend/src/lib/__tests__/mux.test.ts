import { describe, expect, it } from "vitest";

import {
  animatedPreviewUrl,
  isRealPlaybackId,
  MUX_PLAYER_PRESETS,
  posterUrl,
  streamUrl,
} from "@/lib/mux";

const REAL_ID = "VY8IzL32ULAQNLcjdnuNdZap9XXbtsJ7017vPd1jXl7Q";

describe("isRealPlaybackId", () => {
  it.each([
    [REAL_ID, true],
    ["abc123", true],
    ["[PLAYBACK_ID_01]", false],
    ["[PLACEHOLDER]", false],
    ["", false],
    ["   ", false],
    ["  abc  ", true],
  ])("isRealPlaybackId(%s) → %s", (input, expected) => {
    expect(isRealPlaybackId(input)).toBe(expected);
  });
});

describe("posterUrl", () => {
  it("builds a thumbnail URL with default options", () => {
    const url = posterUrl(REAL_ID);
    expect(url).toContain("https://image.mux.com/");
    expect(url).toContain(`${REAL_ID}/thumbnail.webp`);
    expect(url).toContain("time=0");
    expect(url).toContain("width=1920");
    expect(url).toContain("fit_mode=preserve");
  });

  it("respects custom time and width", () => {
    const url = posterUrl(REAL_ID, { time: 12, width: 1280 });
    expect(url).toContain("time=12");
    expect(url).toContain("width=1280");
  });

  it("clamps time to valid range", () => {
    const url = posterUrl(REAL_ID, { time: -5 });
    expect(url).toContain("time=0");

    const urlMax = posterUrl(REAL_ID, { time: 999_999 });
    expect(urlMax).toContain("time=86400");
  });

  it("clamps width to valid range", () => {
    const urlMin = posterUrl(REAL_ID, { width: 100 });
    expect(urlMin).toContain("width=320");

    const urlMax = posterUrl(REAL_ID, { width: 5000 });
    expect(urlMax).toContain("width=3840");
  });

  it("throws on empty playback ID", () => {
    expect(() => posterUrl("")).toThrow("Mux playbackId must be a non-empty string.");
    expect(() => posterUrl("   ")).toThrow("Mux playbackId must be a non-empty string.");
  });
});

describe("animatedPreviewUrl", () => {
  it("builds an animated preview URL with defaults", () => {
    const url = animatedPreviewUrl(REAL_ID);
    expect(url).toContain("https://image.mux.com/");
    expect(url).toContain(`${REAL_ID}/animated.webp`);
    expect(url).toContain("start=2");
    expect(url).toContain("end=6");
    expect(url).toContain("width=960");
  });

  it("respects custom start, end, and width", () => {
    const url = animatedPreviewUrl(REAL_ID, { start: 8, end: 12, width: 1280 });
    expect(url).toContain("start=8");
    expect(url).toContain("end=12");
    expect(url).toContain("width=1280");
  });

  it("ensures end is at least start + 0.5", () => {
    const url = animatedPreviewUrl(REAL_ID, { start: 10, end: 10 });
    expect(url).toContain("end=10.5");
  });

  it("clamps values to valid range", () => {
    const url = animatedPreviewUrl(REAL_ID, { start: -1, end: 999_999, width: 50 });
    expect(url).toContain("start=0");
    expect(url).toContain("end=86400");
    expect(url).toContain("width=320");
  });
});

describe("streamUrl", () => {
  it("builds an HLS manifest URL", () => {
    const url = streamUrl(REAL_ID);
    expect(url).toBe(
      `https://stream.mux.com/${encodeURIComponent(REAL_ID)}.m3u8`,
    );
  });

  it("throws on empty playback ID", () => {
    expect(() => streamUrl("")).toThrow("Mux playbackId must be a non-empty string.");
  });
});

describe("MUX_PLAYER_PRESETS", () => {
  it("defines cinematic and ambient presets", () => {
    expect(MUX_PLAYER_PRESETS.cinematic.maxResolution).toBe("2160p");
    expect(MUX_PLAYER_PRESETS.ambient.maxResolution).toBe("1080p");
    expect(MUX_PLAYER_PRESETS.cinematic.streamType).toBe("on-demand");
  });
});
