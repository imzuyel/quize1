"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_ANIMATION_SETTINGS, type AnimationSettings, type ScrollAnimationType } from "@/lib/animation-config";

const AnimationContext = createContext<{
  settings: AnimationSettings;
  updateSettings: (s: Partial<AnimationSettings>) => void;
}>({
  settings: DEFAULT_ANIMATION_SETTINGS,
  updateSettings: () => {},
});

export function AnimationProvider({
  children,
  initialSettings,
}: {
  children: ReactNode;
  initialSettings?: AnimationSettings;
}) {
  const [settings, setSettings] = useState<AnimationSettings>(initialSettings ?? DEFAULT_ANIMATION_SETTINGS);

  // Apply CSS variables on root element
  useEffect(() => {
    const root = document.documentElement;

    // Card Glow CSS Variables
    root.style.setProperty("--card-glow-enabled", settings.cardBorderEnabled ? "1" : "0");
    const glowBase = settings.cardGlowIntensity === "subtle" ? "0.2" : settings.cardGlowIntensity === "strong" ? "0.75" : "0.45";
    const glowHover = settings.cardGlowIntensity === "subtle" ? "0.45" : settings.cardGlowIntensity === "strong" ? "1.0" : "0.85";
    root.style.setProperty("--card-glow-base-opacity", glowBase);
    root.style.setProperty("--card-hover-glow-opacity", glowHover);

    const speed = settings.cardBorderSpeed === "slow" ? "10s" : settings.cardBorderSpeed === "fast" ? "3s" : "6s";
    root.style.setProperty("--card-glow-speed", speed);

    // Button CSS Variables
    root.style.setProperty("--button-animation-enabled", settings.buttonAnimationEnabled ? "1" : "0");
    const btnGlow = settings.buttonGlowIntensity === "subtle" ? "0.25" : settings.buttonGlowIntensity === "strong" ? "0.8" : "0.5";
    root.style.setProperty("--button-glow-opacity", btnGlow);
    root.style.setProperty("--button-hover-effect", settings.buttonHoverEffect ? "1" : "0");

    // Scroll / AOS CSS Variables
    root.style.setProperty("--scroll-animation-enabled", settings.scrollAnimationEnabled ? "1" : "0");
    root.style.setProperty("--aos-default-duration", `${settings.scrollAnimationDuration}ms`);
    root.style.setProperty("--aos-default-type", settings.scrollAnimationType);

    // Progress CSS Variables
    root.style.setProperty("--progress-animation-enabled", settings.progressAnimationEnabled ? "1" : "0");
    root.style.setProperty("--progress-duration", `${settings.progressAnimationDuration}ms`);
  }, [settings]);

  // Scroll / AOS Observer Logic
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-aos]"));

    if (!settings.scrollAnimationEnabled || prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("aos-animate"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("aos-animate");
            observer.unobserve(target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((el) => {
      if (!el.classList.contains("aos-animate")) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [settings.scrollAnimationEnabled, settings.scrollAnimationType]);

  const updateSettings = (partial: Partial<AnimationSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return (
    <AnimationContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationConfig() {
  return useContext(AnimationContext);
}

export function AOS({
  children,
  type,
  duration,
  delay,
  className = "",
}: {
  children: ReactNode;
  type?: ScrollAnimationType;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      data-aos={type ?? "fade-up"}
      data-aos-duration={duration}
      data-aos-delay={delay}
      style={{
        transitionDuration: duration ? `${duration}ms` : undefined,
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
      className={className}
    >
      {children}
    </div>
  );
}
