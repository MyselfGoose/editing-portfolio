import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW = "1 h" as const;

let ratelimit: Ratelimit | null | undefined;

function createRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW),
    prefix: "gp:contact",
  });
}

function getRatelimit(): Ratelimit | null {
  if (ratelimit === undefined) {
    ratelimit = createRatelimit();
  }
  return ratelimit;
}

/** True on Vercel production or NODE_ENV=production. */
export function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

export function isRateLimitConfigured(): boolean {
  return getRatelimit() !== null;
}

export type RateLimitResult = {
  success: boolean;
  /** Present when the check failed. */
  reason?: "limited" | "unconfigured";
};

/**
 * Sliding-window limit when Upstash is configured.
 * In production without Upstash: fail closed (unconfigured).
 * In development/preview without Upstash: allow (documented).
 */
export async function checkContactRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getRatelimit();
  if (!limiter) {
    if (isProductionRuntime()) {
      return { success: false, reason: "unconfigured" };
    }
    return { success: true };
  }

  const result = await limiter.limit(identifier);
  if (!result.success) {
    return { success: false, reason: "limited" };
  }
  return { success: true };
}

/** Test-only: clear cached limiter so env changes take effect. */
export function resetRateLimitCacheForTests(): void {
  ratelimit = undefined;
}
