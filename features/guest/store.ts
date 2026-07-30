import {
  projectBlueprintSchema,
  type ProjectBlueprint,
} from "@/features/blueprints/schema";
import type { GuestBusiness } from "@/features/guest/schema";
import type { InterviewSummaryData } from "@/features/interviews/schema";

/**
 * Client-side storage model for device workspaces (guest mode).
 * Everything lives in localStorage; nothing is stored on the server.
 */

export interface GuestMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  whyThisMatters?: string;
  suggestedAnswers?: string[];
}

export interface GuestProject {
  id: string;
  createdAt: string;
  business: GuestBusiness;
  prompt: string;
  messages: GuestMessage[];
  summary: InterviewSummaryData | null;
  discoveryComplete: boolean;
  blueprint: ProjectBlueprint | null;
}

export interface GuestStore {
  projects: GuestProject[];
  /** null = project list / start screen */
  activeProjectId: string | null;
}

export const GUEST_STORE_KEY = "forge.guest.v2";
const LEGACY_KEY = "forge.guest.v1";

export const emptyStore: GuestStore = { projects: [], activeProjectId: null };

export function guestProjectStatus(project: GuestProject): string {
  if (project.blueprint) return "Blueprint ready";
  if (project.messages.length > 0) return "In discovery";
  return "New";
}

interface LegacyState {
  business: GuestBusiness | null;
  prompt: string;
  messages: GuestMessage[];
  summary: InterviewSummaryData | null;
  discoveryComplete: boolean;
  blueprint: unknown;
}

/** Loads the store, migrating any single-project v1 session forward. */
export function loadGuestStore(): GuestStore {
  try {
    const raw = window.localStorage.getItem(GUEST_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GuestStore;
      if (Array.isArray(parsed.projects)) {
        return {
          projects: parsed.projects.filter(sanitizeProject),
          activeProjectId: parsed.activeProjectId ?? null,
        };
      }
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as LegacyState;
      window.localStorage.removeItem(LEGACY_KEY);
      if (legacy.business) {
        const migrated: GuestProject = {
          id: `p-${Date.now()}`,
          createdAt: new Date().toISOString(),
          business: legacy.business,
          prompt: legacy.prompt,
          messages: legacy.messages ?? [],
          summary: legacy.summary ?? null,
          discoveryComplete: Boolean(legacy.discoveryComplete),
          blueprint: parseBlueprint(legacy.blueprint),
        };
        return { projects: [migrated], activeProjectId: migrated.id };
      }
    }
  } catch {
    // Fall through to an empty store.
  }
  return emptyStore;
}

export function saveGuestStore(store: GuestStore): void {
  try {
    window.localStorage.setItem(GUEST_STORE_KEY, JSON.stringify(store));
  } catch {
    // Persistence is best-effort (private mode, quota).
  }
}

function parseBlueprint(value: unknown): ProjectBlueprint | null {
  const result = projectBlueprintSchema.safeParse(value);
  return result.success ? result.data : null;
}

function sanitizeProject(project: GuestProject): boolean {
  if (!project?.id || !project.business) return false;
  if (project.blueprint) {
    const valid = projectBlueprintSchema.safeParse(project.blueprint);
    if (!valid.success) project.blueprint = null;
  }
  return true;
}
