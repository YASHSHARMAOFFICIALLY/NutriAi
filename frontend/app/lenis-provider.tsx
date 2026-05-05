"use client";

import Lenis from "lenis";
import type { ReactNode } from "react";
import { useEffect } from "react";

const prefersReducedMotionQuery = "(prefers-reduced-motion: reduce)";

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia(prefersReducedMotionQuery).matches) {
      return;
    }

    const lenis = new Lenis({
      anchors: { offset: -88 },
      autoRaf: true,
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return children;
}
