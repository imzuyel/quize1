"use client";

import { useEffect, useRef, useState, type ReactNode, type HTMLAttributes } from "react";

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
  duration = 600,
  delay = 0,
  threshold = 0.15,
  once = true,
  className = "",
  as: Component = "div",
  style,
  ...rest
}: ScrollRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    // Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setIsRevealed(true);
        return;
      }
    }

    if (!("IntersectionObserver" in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [once, threshold]);

  // Combined styles for ultra-smooth GPU hardware accelerated animation
  const transitionStyle: React.CSSProperties = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: "transform, opacity",
    ...style,
  };

  return (
    <Component
      ref={ref}
      data-reveal-variant={variant}
      className={`scroll-reveal ${
        !isMounted || isRevealed ? "scroll-reveal-visible" : "scroll-reveal-hidden"
      } ${className}`.trim()}
      style={transitionStyle}
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
  staggerDelay = 80,
  duration = 600,
  className = "",
}: {
  children: ReactNode[];
  variant?: ScrollRevealVariant;
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <ScrollReveal
              key={index}
              variant={variant}
              delay={baseDelay + index * staggerDelay}
              duration={duration}
            >
              {child}
            </ScrollReveal>
          ))
        : children}
    </div>
  );
}
