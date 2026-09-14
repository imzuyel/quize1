export type CardGlowIntensity = "subtle" | "medium" | "strong";
export type CardBorderSpeed = "slow" | "normal" | "fast";
export type ButtonGlowIntensity = "subtle" | "medium" | "strong";
export type ScrollAnimationType = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "slide-up";

export type AnimationSettings = {
  cardBorderEnabled: boolean;
  cardGlowIntensity: CardGlowIntensity;
  cardBorderSpeed: CardBorderSpeed;
  buttonAnimationEnabled: boolean;
  buttonGlowIntensity: ButtonGlowIntensity;
  buttonHoverEffect: boolean;
  scrollAnimationEnabled: boolean;
  scrollAnimationType: ScrollAnimationType;
  scrollAnimationDuration: number;
  scrollAnimationStagger: number;
  progressAnimationEnabled: boolean;
  progressAnimationDuration: number;
};

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  cardBorderEnabled: true,
  cardGlowIntensity: "medium",
  cardBorderSpeed: "normal",
  buttonAnimationEnabled: true,
  buttonGlowIntensity: "medium",
  buttonHoverEffect: true,
  scrollAnimationEnabled: true,
  scrollAnimationType: "fade-up",
  scrollAnimationDuration: 500,
  scrollAnimationStagger: 80,
  progressAnimationEnabled: true,
  progressAnimationDuration: 800,
};

export function mergeAnimationSettings(raw?: unknown): AnimationSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_ANIMATION_SETTINGS;
  const obj = raw as Record<string, unknown>;

  const cardBorderEnabled = typeof obj.cardBorderEnabled === "boolean" ? obj.cardBorderEnabled : DEFAULT_ANIMATION_SETTINGS.cardBorderEnabled;
  const cardGlowIntensity: CardGlowIntensity =
    obj.cardGlowIntensity === "subtle" || obj.cardGlowIntensity === "strong" ? obj.cardGlowIntensity : "medium";
  const cardBorderSpeed: CardBorderSpeed =
    obj.cardBorderSpeed === "slow" || obj.cardBorderSpeed === "fast" ? obj.cardBorderSpeed : "normal";

  const buttonAnimationEnabled = typeof obj.buttonAnimationEnabled === "boolean" ? obj.buttonAnimationEnabled : DEFAULT_ANIMATION_SETTINGS.buttonAnimationEnabled;
  const buttonGlowIntensity: ButtonGlowIntensity =
    obj.buttonGlowIntensity === "subtle" || obj.buttonGlowIntensity === "strong" ? obj.buttonGlowIntensity : "medium";
  const buttonHoverEffect = typeof obj.buttonHoverEffect === "boolean" ? obj.buttonHoverEffect : DEFAULT_ANIMATION_SETTINGS.buttonHoverEffect;

  const scrollAnimationEnabled = typeof obj.scrollAnimationEnabled === "boolean" ? obj.scrollAnimationEnabled : DEFAULT_ANIMATION_SETTINGS.scrollAnimationEnabled;
  const validTypes: ScrollAnimationType[] = ["fade-up", "fade-down", "fade-left", "fade-right", "zoom-in", "slide-up"];
  const scrollAnimationType: ScrollAnimationType =
    typeof obj.scrollAnimationType === "string" && validTypes.includes(obj.scrollAnimationType as ScrollAnimationType)
      ? (obj.scrollAnimationType as ScrollAnimationType)
      : "fade-up";
  const scrollAnimationDuration =
    typeof obj.scrollAnimationDuration === "number" && obj.scrollAnimationDuration >= 100 && obj.scrollAnimationDuration <= 3000
      ? obj.scrollAnimationDuration
      : DEFAULT_ANIMATION_SETTINGS.scrollAnimationDuration;
  const scrollAnimationStagger =
    typeof obj.scrollAnimationStagger === "number" && obj.scrollAnimationStagger >= 0 && obj.scrollAnimationStagger <= 1000
      ? obj.scrollAnimationStagger
      : DEFAULT_ANIMATION_SETTINGS.scrollAnimationStagger;

  const progressAnimationEnabled = typeof obj.progressAnimationEnabled === "boolean" ? obj.progressAnimationEnabled : DEFAULT_ANIMATION_SETTINGS.progressAnimationEnabled;
  const progressAnimationDuration =
    typeof obj.progressAnimationDuration === "number" && obj.progressAnimationDuration >= 100 && obj.progressAnimationDuration <= 3000
      ? obj.progressAnimationDuration
      : DEFAULT_ANIMATION_SETTINGS.progressAnimationDuration;

  return {
    cardBorderEnabled,
    cardGlowIntensity,
    cardBorderSpeed,
    buttonAnimationEnabled,
    buttonGlowIntensity,
    buttonHoverEffect,
    scrollAnimationEnabled,
    scrollAnimationType,
    scrollAnimationDuration,
    scrollAnimationStagger,
    progressAnimationEnabled,
    progressAnimationDuration,
  };
}
