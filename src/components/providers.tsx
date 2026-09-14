"use client";

import { Suspense, type ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "./ui";
import { TopLoader } from "./top-loader";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        {children}
      </ToastProvider>
    </I18nProvider>
  );
}
