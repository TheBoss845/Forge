import { describe, expect, it } from "vitest";

import { compactDiff, diffLines } from "@/lib/utilities/diff";

describe("diffLines", () => {
  it("marks identical content as context", () => {
    const result = diffLines("a\nb", "a\nb");
    expect(result).toEqual([
      { kind: "context", text: "a" },
      { kind: "context", text: "b" },
    ]);
  });

  it("detects added and removed lines", () => {
    const result = diffLines("a\nb\nc", "a\nx\nc");
    expect(result).toEqual([
      { kind: "context", text: "a" },
      { kind: "removed", text: "b" },
      { kind: "added", text: "x" },
      { kind: "context", text: "c" },
    ]);
  });

  it("handles pure additions and deletions at the end", () => {
    expect(diffLines("a", "a\nb").at(-1)).toEqual({ kind: "added", text: "b" });
    expect(diffLines("a\nb", "a").at(-1)).toEqual({
      kind: "removed",
      text: "b",
    });
  });
});

describe("compactDiff", () => {
  it("collapses long unchanged runs", () => {
    const before = Array.from({ length: 30 }, (_, i) => `line ${i}`).join("\n");
    const after = before.replace("line 15", "line fifteen");
    const compact = compactDiff(diffLines(before, after), 2);

    const skips = compact.filter((entry) => entry.kind === "skip");
    expect(skips.length).toBeGreaterThan(0);
    expect(compact.some((entry) => entry.kind === "added")).toBe(true);
  });

  it("keeps everything when changes are near each other", () => {
    const compact = compactDiff(diffLines("a\nb", "a\nc"), 3);
    expect(compact.every((entry) => entry.kind !== "skip")).toBe(true);
  });
});
