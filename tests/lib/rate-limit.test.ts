import { describe, expect, it } from "vitest";

import { checkRateLimit } from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-under-${Math.random()}`;
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit(key, { limit: 5, windowMs: 60_000 }).allowed).toBe(
        true,
      );
    }
  });

  it("blocks requests over the limit with a retry hint", () => {
    const key = `test-over-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      checkRateLimit(key, { limit: 3, windowMs: 60_000 });
    }
    const result = checkRateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    checkRateLimit(keyA, { limit: 1, windowMs: 60_000 });
    expect(checkRateLimit(keyA, { limit: 1, windowMs: 60_000 }).allowed).toBe(
      false,
    );
    expect(checkRateLimit(keyB, { limit: 1, windowMs: 60_000 }).allowed).toBe(
      true,
    );
  });
});
