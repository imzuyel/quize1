"use client";

import { useEffect, useRef, useState, type ReactNode, type HTMLAttributes } from "react";
import { useAnimation } from "@/components/animation-provider";

export type ScrollRevealVariant =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "subtle-slide";

interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: ScrollRevealVariant;
  duration?: number; // ms
  delay?: number; // ms
  threshold?: number; // 0 to 1
  once?: boolean;
  className?: string;
  as?: React.ElementType;
}

export function ScrollReveal({
  children,
  variant = "fade-up",
  duration = 500,
  delay = 0,
  threshold = 0.01,
  once = true,
  className = "",
  as: Component = "div",
  style,
  ...rest
}: ScrollRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasCheckedViewport, setHasCheckedViewport] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Connect to global app animation settings
  const { settings } = useAnimation();
  const animsDisabled = settings ? (!settings.enabled || settings.reducedMotion) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If animations are globally disabled, reveal instantly
    if (animsDisabled) {
      setIsRevealed(true);
      setHasCheckedViewport(true);
      return;
    }

    let inIframe = false;
    try {
      inIframe = typeof window !== "undefined" && window.self !== window.top;
    } catch (e) {
      inIframe = true;
    }

    if (inIframe) {
      // In sandboxed/cross-origin iframe previews, trigger reveal immediately to prevent stuck invisible states
      const timer = setTimeout(() => {
        setIsRevealed(true);
        setHasCheckedViewport(true);
      }, 50);
      return () => clearTimeout(timer);
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsRevealed(true);
      setHasCheckedViewport(true);
      return;
    }

    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            setHasCheckedViewport(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else {
            setHasCheckedViewport(true);
            if (!once) {
              setIsRevealed(false);
            }
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: "30px 0px 30px 0px",
      }
    );

    observer.observe(currentRef);

    // Fail-safe timeout: guarantees element becomes visible even if observer doesn't fire
    const timer = setTimeout(() => {
      setIsRevealed(true);
      setHasCheckedViewport(true);
    }, 1200);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [once, threshold, animsDisabled]);

  // Determine the exact rendering class state to prevent hydration flashing:
  // 1. SSR & Hydration: fully visible.
  // 2. Client mounted but viewport check pending: fully visible (to avoid a 1-frame blink).
  // 3. Checked and intersecting: revealed.
  // 4. Checked and not intersecting: animating/hidden state.
  let revealClass = "scroll-reveal";
  if (mounted && !animsDisabled) {
    if (isRevealed) {
      revealClass = "scroll-reveal scroll-reveal-visible";
    } else if (hasCheckedViewport) {
      revealClass = "scroll-reveal scroll-reveal-animating";
    }
  }

  return (
    <Component
      ref={ref}
      data-reveal-variant={variant}
      className={`${revealClass} ${className}`.trim()}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** Reusable Stagger Container for list items and grids */
export function ScrollRevealGroup({
  children,
  variant = "fade-up",
  baseDelay = 0,
  staggerDelay = 60,
  duration = 500,
  className = "",
}: {
  children: ReactNode | ReactNode[];
  variant?: ScrollRevealVariant;
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}) {
  const arrayChildren = Array.isArray(children)
    ? children
    : children
    ? [children]
    : [];

  return (
    <div className={className}>
      {arrayChildren.map((child, index) => (
        <ScrollReveal
          key={index}
          variant={variant}
          delay={baseDelay + index * staggerDelay}
          duration={duration}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
