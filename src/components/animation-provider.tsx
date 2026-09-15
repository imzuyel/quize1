"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_ANIMATION_SETTINGS, type AnimationSettings } from "@/lib/animation-config";

type AnimationContextType = {
  settings: AnimationSettings;
  updateSettings: (newSettings: Partial<AnimationSettings>) => void;
};

const AnimationContext = createContext<AnimationContextType>({
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
  const [settings, setSettings] = useState<AnimationSettings>(
    initialSettings || DEFAULT_ANIMATION_SETTINGS
  );

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("motion-low", settings.reducedMotion || settings.intensity === "low");
    }
  }, [settings.reducedMotion, settings.intensity]);

  const updateSettings = (newSettings: Partial<AnimationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AnimationContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  return useContext(AnimationContext);
}
