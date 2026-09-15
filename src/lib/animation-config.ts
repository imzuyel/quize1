export type AnimationSettings = {
  enabled: boolean;
  reducedMotion: boolean;
  speed: "slow" | "normal" | "fast";
  intensity: "low" | "medium" | "high";
  particleEffects: boolean;
  soundEffects: boolean;
};

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  enabled: true,
  reducedMotion: false,
  speed: "normal",
  intensity: "medium",
  particleEffects: true,
  soundEffects: true,
};

export function mergeAnimationSettings(input: unknown): AnimationSettings {
  if (!input || typeof input !== "object") return DEFAULT_ANIMATION_SETTINGS;
  const raw = input as Partial<AnimationSettings>;
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULT_ANIMATION_SETTINGS.enabled,
    reducedMotion: typeof raw.reducedMotion === "boolean" ? raw.reducedMotion : DEFAULT_ANIMATION_SETTINGS.reducedMotion,
    speed: raw.speed === "slow" || raw.speed === "fast" ? raw.speed : "normal",
    intensity: raw.intensity === "low" || raw.intensity === "high" ? raw.intensity : "medium",
    particleEffects: typeof raw.particleEffects === "boolean" ? raw.particleEffects : DEFAULT_ANIMATION_SETTINGS.particleEffects,
    soundEffects: typeof raw.soundEffects === "boolean" ? raw.soundEffects : DEFAULT_ANIMATION_SETTINGS.soundEffects,
  };
}
