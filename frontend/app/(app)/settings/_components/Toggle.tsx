"use client";

import { useState } from "react";
import { motion } from "motion/react";

export function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);

  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-10 rounded-full transition-colors duration-200 ${
        on ? "bg-forest" : "bg-ink/[0.12]"
      }`}
    >
      <motion.span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
        animate={{ x: on ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    </button>
  );
}
