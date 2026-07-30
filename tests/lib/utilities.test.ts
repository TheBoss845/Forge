import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/lib/utilities/format";
import { slugify } from "@/lib/utilities/slug";

describe("slugify", () => {
  it("lowercases and hyphenates, appending a unique suffix", () => {
    const slug = slugify("Bella's Vet Clinic!");
    expect(slug).toMatch(/^bella-s-vet-clinic-[a-z0-9]{6}$/);
  });

  it("handles names with only special characters", () => {
    expect(slugify("!!!")).toMatch(/^[a-z0-9]{6}$/);
  });

  it("produces different slugs for the same name", () => {
    expect(slugify("Same Name")).not.toEqual(slugify("Same Name"));
  });
});

describe("formatRelativeTime", () => {
  it("formats recent timestamps", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toContain("hour");
  });

  it("handles invalid dates gracefully", () => {
    expect(formatRelativeTime("not-a-date")).toBe("recently");
  });
});
