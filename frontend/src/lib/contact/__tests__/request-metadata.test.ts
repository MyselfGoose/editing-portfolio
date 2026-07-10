import { describe, expect, it } from "vitest";

import {
  buildSubmissionMetadata,
  extractServerMetadata,
  formatCoordinates,
  formatLocation,
  getClientIp,
} from "@/lib/contact/request-metadata";

function createHeaders(values: Record<string, string>): Headers {
  return new Headers(values);
}

describe("getClientIp", () => {
  it("uses the first x-forwarded-for hop", () => {
    const headers = createHeaders({
      "x-forwarded-for": "203.0.113.10, 70.41.3.18",
    });
    expect(getClientIp(headers)).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip", () => {
    const headers = createHeaders({
      "x-real-ip": "198.51.100.4",
    });
    expect(getClientIp(headers)).toBe("198.51.100.4");
  });

  it("returns unknown when no ip headers exist", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("extractServerMetadata", () => {
  it("parses vercel geo and user-agent headers", () => {
    const headers = createHeaders({
      "x-forwarded-for": "203.0.113.10",
      "x-vercel-ip-city": "Austin",
      "x-vercel-ip-country-region": "TX",
      "x-vercel-ip-country": "US",
      "x-vercel-ip-latitude": "30.2672",
      "x-vercel-ip-longitude": "-97.7431",
      "x-vercel-ip-timezone": "America/Chicago",
      "x-vercel-id": "sfo1::abc123",
      referer: "https://goose-productions.com/contact",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const metadata = extractServerMetadata(headers, "2026-07-10T12:00:00.000Z");

    expect(metadata.ip).toBe("203.0.113.10");
    expect(metadata.city).toBe("Austin");
    expect(metadata.region).toBe("TX");
    expect(metadata.country).toBe("US");
    expect(metadata.timezone).toBe("America/Chicago");
    expect(metadata.referrer).toBe("https://goose-productions.com/contact");
    expect(metadata.requestId).toBe("sfo1::abc123");
    expect(metadata.browser).toContain("Chrome");
    expect(metadata.os).toContain("macOS");
    expect(metadata.submittedAt).toBe("2026-07-10T12:00:00.000Z");
  });
});

describe("buildSubmissionMetadata", () => {
  it("combines server and client metadata", () => {
    const metadata = buildSubmissionMetadata(
      createHeaders({ "x-real-ip": "198.51.100.4" }),
      {
        pageUrl: "/contact",
        language: "en-US",
      },
      "2026-07-10T12:00:00.000Z",
    );

    expect(metadata.server.ip).toBe("198.51.100.4");
    expect(metadata.client?.pageUrl).toBe("/contact");
    expect(metadata.client?.language).toBe("en-US");
  });
});

describe("formatLocation", () => {
  it("joins city, region, and country", () => {
    expect(
      formatLocation({
        ip: "203.0.113.10",
        city: "Austin",
        region: "TX",
        country: "US",
        latitude: null,
        longitude: null,
        timezone: null,
        browser: null,
        os: null,
        device: null,
        userAgent: null,
        referrer: null,
        submittedAt: "2026-07-10T12:00:00.000Z",
        requestId: null,
      }),
    ).toBe("Austin, TX, US");
  });
});

describe("formatCoordinates", () => {
  it("formats latitude and longitude", () => {
    expect(
      formatCoordinates({
        ip: "203.0.113.10",
        city: null,
        region: null,
        country: null,
        latitude: "30.2672",
        longitude: "-97.7431",
        timezone: null,
        browser: null,
        os: null,
        device: null,
        userAgent: null,
        referrer: null,
        submittedAt: "2026-07-10T12:00:00.000Z",
        requestId: null,
      }),
    ).toBe("30.2672, -97.7431");
  });
});
