import { describe, expect, it } from "vitest";

import { extractJsonObject } from "@/lib/ai/json";

describe("extractJsonObject", () => {
  it("parses a plain JSON object", () => {
    expect(extractJsonObject('{"a": 1}')).toEqual({ a: 1 });
  });

  it("parses JSON inside a fenced code block", () => {
    const text = 'Here you go:\n```json\n{"message": "hi"}\n```\nDone.';
    expect(extractJsonObject(text)).toEqual({ message: "hi" });
  });

  it("parses JSON inside an unlabeled fence", () => {
    expect(extractJsonObject('```\n{"x": true}\n```')).toEqual({ x: true });
  });

  it("parses JSON embedded in prose", () => {
    const text = 'Sure! {"a": {"b": [1, 2]}} Hope that helps.';
    expect(extractJsonObject(text)).toEqual({ a: { b: [1, 2] } });
  });

  it("returns null for non-JSON text", () => {
    expect(extractJsonObject("no json here")).toBeNull();
  });

  it("returns null for JSON primitives", () => {
    expect(extractJsonObject("42")).toBeNull();
  });
});
