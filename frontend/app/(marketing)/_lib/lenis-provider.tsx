"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import type { ReactNode } from "react";

type LenisProviderProps = {
  children: ReactNode;
};

// Mounts a single Lenis instance for the marketing layout and drives its
// rAF loop. Honors prefers-reduced-motion by bailing out entirely so
// keyboard/AT users get native scroll.
export function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
