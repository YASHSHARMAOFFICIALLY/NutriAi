"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { revealItem, revealStagger } from "../_lib/motion";

type RevealProps = {
  children: ReactNode;
  as?: "div" | "section" | "h1" | "h2" | "p" | "span" | "li";
  className?: string;
  /** `onLoad` plays immediately; `inView` plays the first time the element enters the viewport. */
  trigger?: "onLoad" | "inView";
  /** Extra delay (seconds) before the animation starts. */
  delay?: number;
};

export function Reveal({
  children,
  as = "div",
  className,
  trigger = "inView",
  delay = 0,
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (prefersReduced) {
    return <Tag className={className}>{children}</Tag>;
  }

  const animateProp =
    trigger === "onLoad"
      ? { animate: "show" }
      : { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } };

  return (
    <Tag
      className={className}
      variants={revealItem}
      initial="hidden"
      transition={{ delay }}
      {...animateProp}
    >
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  trigger?: "onLoad" | "inView";
};

/** Wraps a group of <Reveal /> children and staggers their entry. */
export function RevealGroup({ children, className, trigger = "onLoad" }: RevealGroupProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const animateProp =
    trigger === "onLoad"
      ? { animate: "show" }
      : { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } };

  return (
    <motion.div
      className={className}
      variants={revealStagger}
      initial="hidden"
      {...animateProp}
    >
      {children}
    </motion.div>
  );
}
