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

export function isRateLimitConfigured(): boolean {
  return getRatelimit() !== null;
}

export async function checkContactRateLimit(
  identifier: string,
): Promise<{ success: boolean }> {
  const limiter = getRatelimit();
  if (!limiter) {
    return { success: true };
  }

  const result = await limiter.limit(identifier);
  return { success: result.success };
}
