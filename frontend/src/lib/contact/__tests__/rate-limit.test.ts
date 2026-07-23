import { afterEach, describe, expect, it, vi } from "vitest";

describe("contact rate-limit", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("allows when Upstash is missing outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const { checkContactRateLimit, resetRateLimitCacheForTests } =
      await import("@/lib/contact/rate-limit");
    resetRateLimitCacheForTests();

    await expect(checkContactRateLimit("127.0.0.1")).resolves.toEqual({
      success: true,
    });
  });

  it("fails closed when Upstash is missing in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const { checkContactRateLimit, resetRateLimitCacheForTests } =
      await import("@/lib/contact/rate-limit");
    resetRateLimitCacheForTests();

    await expect(checkContactRateLimit("203.0.113.10")).resolves.toEqual({
      success: false,
      reason: "unconfigured",
    });
  });
});
