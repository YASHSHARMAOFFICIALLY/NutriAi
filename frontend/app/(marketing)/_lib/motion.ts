import type { Transition, Variants } from "framer-motion";

// Shared easing for every blur-to-clear reveal across the landing page.
// cubic-bezier(0.22, 1, 0.36, 1) — ease-out-cubic-ish; matches the design brief.
export const easeOutExpo: Transition["ease"] = [0.22, 1, 0.36, 1];

export const revealTransition = {
  duration: 0.8,
  ease: easeOutExpo,
} satisfies Transition;

// A single item that blurs in from 12px with a small upward translate.
export const revealItem: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 20 },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: revealTransition,
  },
};

// A parent that staggers its children — useful for the hero load sequence
// (headline → subhead → CTA group → photo).
export const revealStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};
