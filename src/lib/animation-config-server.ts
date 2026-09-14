import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_ANIMATION_SETTINGS, mergeAnimationSettings, type AnimationSettings } from "./animation-config";

const globalForAnimation = globalThis as typeof globalThis & {
  __pgtscAnimationSettings?: { data: AnimationSettings; at: number };
};

const TTL_MS = 15_000;

export async function getAnimationSettings(force = false): Promise<AnimationSettings> {
  const cached = globalForAnimation.__pgtscAnimationSettings;
  if (!force && cached && Date.now() - cached.at < TTL_MS) return cached.data;

  try {
    const rows = await db.select().from(settings).where(eq(settings.key, "animations")).limit(1);

    if (rows.length > 0 && rows[0].value) {
      const merged = mergeAnimationSettings(rows[0].value);
      globalForAnimation.__pgtscAnimationSettings = { data: merged, at: Date.now() };
      return merged;
    }
  } catch (err) {
    console.error("Failed to load animation settings from DB:", err);
  }

  globalForAnimation.__pgtscAnimationSettings = { data: DEFAULT_ANIMATION_SETTINGS, at: Date.now() };
  return DEFAULT_ANIMATION_SETTINGS;
}

export function invalidateAnimationSettings(): void {
  delete globalForAnimation.__pgtscAnimationSettings;
}
