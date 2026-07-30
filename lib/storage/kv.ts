import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Minimal key-value storage with two adapters:
 *
 * - Netlify Blobs when running on Netlify (zero configuration — it is part
 *   of the hosting platform itself, no extra account or key needed).
 * - A local file adapter for development and testing (FORGE_KV_DIR).
 *
 * This powers Forge's built-in accounts when no Supabase database is
 * configured. When neither adapter is available, account features
 * gracefully fall back to device-only workspaces.
 */

export interface KvStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

function fileAdapter(directory: string): KvStore {
  const fileFor = (key: string) =>
    path.join(directory, `${encodeURIComponent(key)}.json`);
  return {
    async get(key) {
      try {
        return await readFile(fileFor(key), "utf8");
      } catch {
        return null;
      }
    },
    async set(key, value) {
      await mkdir(directory, { recursive: true });
      await writeFile(fileFor(key), value, "utf8");
    },
    async delete(key) {
      try {
        await unlink(fileFor(key));
      } catch {
        // Already gone.
      }
    },
  };
}

function netlifyBlobsAdapter(): KvStore {
  return {
    async get(key) {
      const { getStore } = await import("@netlify/blobs");
      const value = await getStore("forge").get(key, { type: "text" });
      return value ?? null;
    },
    async set(key, value) {
      const { getStore } = await import("@netlify/blobs");
      await getStore("forge").set(key, value);
    },
    async delete(key) {
      const { getStore } = await import("@netlify/blobs");
      await getStore("forge").delete(key);
    },
  };
}

export function isKvAvailable(): boolean {
  return Boolean(
    process.env.FORGE_KV_DIR ||
    process.env.NETLIFY === "true" ||
    process.env.NETLIFY_BLOBS_CONTEXT,
  );
}

let cached: KvStore | null = null;

/** Returns the configured store, or null when no storage is available. */
export function getKvStore(): KvStore | null {
  if (!isKvAvailable()) return null;
  if (!cached) {
    cached = process.env.FORGE_KV_DIR
      ? fileAdapter(process.env.FORGE_KV_DIR)
      : netlifyBlobsAdapter();
  }
  return cached;
}
