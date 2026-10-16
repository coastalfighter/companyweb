import "server-only";
import { type Fetch } from "./integrations/http";

export interface RateLimiter {
  /** Records a hit and returns whether the caller is still within the limit. */
  hit(key: string): Promise<boolean>;
}

/**
 * Per-instance fixed window. Fine for development and as a fallback; on serverless
 * each instance has its own memory, so configure Upstash in production.
 */
export function memoryRateLimiter(
  limit: number,
  windowMs: number,
  now: () => number = Date.now,
): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    async hit(key) {
      const t = now();
      for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
      const entry = hits.get(key);
      if (!entry) {
        hits.set(key, { count: 1, resetAt: t + windowMs });
        return true;
      }
      entry.count += 1;
      return entry.count <= limit;
    },
  };
}

/** Upstash Redis REST: INCR + EXPIRE NX in one pipeline. Fails open (logged) so an outage never blocks leads. */
export function upstashRateLimiter(
  config: { url: string; token: string },
  limit: number,
  windowSeconds: number,
  fetchImpl: Fetch = fetch,
): RateLimiter {
  return {
    async hit(key) {
      const redisKey = `ratelimit:contact:${key}`;
      try {
        const response = await fetchImpl(`${config.url.replace(/\/$/, "")}/pipeline`, {
          method: "POST",
          headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
          body: JSON.stringify([
            ["INCR", redisKey],
            ["EXPIRE", redisKey, String(windowSeconds), "NX"],
          ]),
          signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const [incr] = (await response.json()) as [{ result?: number }];
        return (incr?.result ?? 0) <= limit;
      } catch (error) {
        console.error("[contact] rate limiter unavailable, allowing request", error);
        return true;
      }
    },
  };
}
