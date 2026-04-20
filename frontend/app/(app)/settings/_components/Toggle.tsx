"use client";

import { motion } from "framer-motion";

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative h-6 w-10 rounded-full transition-colors duration-200 ${
        value ? "bg-forest" : "bg-ink/[0.12]"
      }`}
    >
      <motion.span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
        animate={{ x: value ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    </button>
  );
}
