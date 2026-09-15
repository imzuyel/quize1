"use client";

import { Suspense, type ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "./ui";
import { TopLoader } from "./top-loader";
import { AnimationProvider } from "./animation-provider";
import type { AnimationSettings } from "@/lib/animation-config";

export function Providers({
  children,
  animationSettings,
}: {
  children: ReactNode;
  animationSettings?: AnimationSettings;
}) {
  return (
    <I18nProvider>
      <AnimationProvider initialSettings={animationSettings}>
        <ToastProvider>
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          {children}
        </ToastProvider>
      </AnimationProvider>
    </I18nProvider>
  );
}
