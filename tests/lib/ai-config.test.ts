import { afterEach, describe, expect, it, vi } from "vitest";

import { getAiProvider, isAiConfigured } from "@/lib/ai";

const AI_VARS = [
  "AI_PROVIDER",
  "AI_MODEL",
  "AI_API_KEY",
  "AI_BASE_URL",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
];

function clearEnv() {
  for (const name of AI_VARS) {
    vi.stubEnv(name, "");
    delete process.env[name];
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AI configuration resolution", () => {
  it("is unconfigured with no variables", () => {
    clearEnv();
    expect(isAiConfigured()).toBe(false);
    expect(getAiProvider()).toBeNull();
  });

  it("works with just OPENAI_API_KEY", () => {
    clearEnv();
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    expect(isAiConfigured()).toBe(true);
    const provider = getAiProvider();
    expect(provider?.name).toBe("openai");
    expect(provider?.model).toBe("gpt-4o");
  });

  it("works with just ANTHROPIC_API_KEY", () => {
    clearEnv();
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    expect(getAiProvider()?.name).toBe("anthropic");
  });

  it("assumes OpenAI for a bare AI_API_KEY", () => {
    clearEnv();
    vi.stubEnv("AI_API_KEY", "sk-test");
    expect(getAiProvider()?.name).toBe("openai");
  });

  it("respects explicit AI_PROVIDER and AI_MODEL", () => {
    clearEnv();
    vi.stubEnv("AI_PROVIDER", "anthropic");
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    vi.stubEnv("AI_MODEL", "claude-opus-4");
    const provider = getAiProvider();
    expect(provider?.name).toBe("anthropic");
    expect(provider?.model).toBe("claude-opus-4");
  });

  it("rejects unknown providers", () => {
    clearEnv();
    vi.stubEnv("AI_PROVIDER", "skynet");
    vi.stubEnv("AI_API_KEY", "key");
    expect(getAiProvider()).toBeNull();
  });
});
