"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollEffects() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Passive scroll listener for maximum scrolling performance
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Show/hide scroll to top button
      if (scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // Add glassy style indicators to fixed headers
      if (scrollY > 15) {
        setIsScrolled(true);
        document.body.classList.add("is-scrolled");
      } else {
        setIsScrolled(false);
        document.body.classList.remove("is-scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once initially
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("is-scrolled");
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Premium Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:scale-115 active:scale-95 cursor-pointer border border-white/20 hover:shadow-[0_8px_25px_rgba(124,58,237,0.5)] ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0 pointer-events-none"
        }`}
        title="উপরে যান"
        aria-label="উপরে যান"
      >
        <ArrowUp className="h-5 w-5 animate-bounce" style={{ animationDuration: "2s" }} />
      </button>

      {/* Embedded dynamic CSS styles for scrolled header animations */}
      <style jsx global>{`
        /* Dynamic scroll and fixed header glass styling */
        header.sticky, header.fixed {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        body.is-scrolled header.sticky,
        body.is-scrolled header.fixed {
          background-color: rgba(23, 28, 74, 0.9) !important;
          backdrop-filter: blur(16px) !important;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          transform: translate3d(0, 0, 0);
        }
        
        /* Light mode AppShell header styling on scroll */
        body.is-scrolled .min-h-screen > header.sticky {
          background-color: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(16px) !important;
          box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.08) !important;
          border-color: rgba(0, 0, 0, 0.06) !important;
        }

        /* Dark mode AppShell header styling on scroll */
        html.dark body.is-scrolled .min-h-screen > header.sticky {
          background-color: rgba(15, 23, 42, 0.85) !important;
          backdrop-filter: blur(16px) !important;
          box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.4) !important;
          border-color: rgba(255, 255, 255, 0.06) !important;
        }
      `}</style>
    </>
  );
}
