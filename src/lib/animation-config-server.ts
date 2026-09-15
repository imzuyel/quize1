/** Server-only reader for animation settings (cached briefly). */
import { db } from "@/db";
import { settings } from "@/db/schema";
import { mergeAnimationSettings, type AnimationSettings } from "./animation-config";
import { eq } from "drizzle-orm";

const globalForAnimationSettings = globalThis as typeof globalThis & {
  __pgtscAnimationSettings?: { data: AnimationSettings; at: number };
};

const TTL_MS = 15_000;

export async function getAnimationSettings(force = false): Promise<AnimationSettings> {
  const cached = globalForAnimationSettings.__pgtscAnimationSettings;
  if (!force && cached && Date.now() - cached.at < TTL_MS) return cached.data;
  try {
    const rows = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "animations"))
      .limit(1);
    const data = mergeAnimationSettings(rows[0]?.value);
    globalForAnimationSettings.__pgtscAnimationSettings = { data, at: Date.now() };
    return data;
  } catch {
    return mergeAnimationSettings(null);
  }
}

export function invalidateAnimationSettings() {
  globalForAnimationSettings.__pgtscAnimationSettings = undefined;
}
