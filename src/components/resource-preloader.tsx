"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Primary routes to prefetch in background idle time for instant dashboard transitions */
const CRITICAL_ROUTES = [
  "/student",
  "/teacher",
  "/host",
  "/play",
  "/admin",
  "/developer",
  "/about",
  "/rules",
  "/reviews",
  "/gallery",
];

export function ResourcePreloader() {
  const router = useRouter();

  useEffect(() => {
    // Perform prefetching during idle browser time to avoid blocking initial render
    const prefetchRoutes = () => {
      CRITICAL_ROUTES.forEach((path) => {
        try {
          router.prefetch(path);
        } catch {
          // Ignore prefetch aborts on fast user interactions
        }
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(prefetchRoutes, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    } else {
      const timerId = setTimeout(prefetchRoutes, 1000);
      return () => clearTimeout(timerId);
    }
  }, [router]);

  return null;
}
