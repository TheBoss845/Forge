/**
 * In-memory sliding-window rate limiter.
 *
 * Known limitation: state is per server instance, so limits reset on deploys
 * and are not shared across instances. Good enough for MVP abuse protection;
 * replace with a shared store (e.g. Upstash) before scaling horizontally.
 */

const windows = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (windows.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((oldest + windowMs - now) / 1000),
      ),
    };
  }

  timestamps.push(now);
  windows.set(key, timestamps);

  // Opportunistic cleanup to keep the map from growing without bound.
  if (windows.size > 10_000) {
    for (const [mapKey, value] of windows) {
      if (value.every((t) => t <= cutoff)) windows.delete(mapKey);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export const AI_RATE_LIMIT = { limit: 20, windowMs: 5 * 60 * 1000 };
