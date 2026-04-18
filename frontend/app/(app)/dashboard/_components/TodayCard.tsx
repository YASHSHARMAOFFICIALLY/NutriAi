"use client";

import { motion } from "motion/react";

const CALORIES = { eaten: 1462, target: 2150 };
const PCT = CALORIES.eaten / CALORIES.target;

const MACROS = [
  { label: "Protein", eaten: 82, target: 128, color: "#5E8A69", delay: 0.5 },
  { label: "Carbs", eaten: 140, target: 200, color: "#1F3B2D", delay: 0.65 },
  { label: "Fat", eaten: 38, target: 60, color: "#7FA687", delay: 0.8 },
] as const;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CalorieRing() {
  return (
    <div className="relative shrink-0">
      <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90" aria-hidden>
        {/* Track */}
        <circle
          cx="74" cy="74" r="54"
          fill="none"
          stroke="rgba(31,59,45,0.07)"
          strokeWidth="13"
        />
        {/* Fill */}
        <motion.circle
          cx="74" cy="74" r="54"
          fill="none"
          stroke="#5E8A69"
          strokeWidth="13"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: PCT }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.25 }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display text-[28px] font-bold leading-none text-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          {CALORIES.eaten.toLocaleString()}
        </motion.span>
        <span className="mt-1 text-[11px] text-ink-muted">
          of {CALORIES.target.toLocaleString()} kcal
        </span>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  eaten,
  target,
  color,
  delay,
}: (typeof MACROS)[number]) {
  const pct = eaten / target;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-ink-muted">{label}</span>
        <span className="font-medium text-ink">
          {eaten}g{" "}
          <span className="font-normal text-ink-muted">/ {target}g</span>
        </span>
      </div>
      <div className="h-[5px] w-full overflow-hidden rounded-full bg-ink/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, transformOrigin: "left" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct }}
          transition={{ duration: 1.1, ease: EASE, delay }}
        />
      </div>
    </div>
  );
}

export function TodayCard() {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-8 shadow-[0_10px_40px_rgba(31,59,45,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-600">
            Today&apos;s intake
          </p>
          <h2 className="mt-1 font-display text-[22px] font-bold leading-none text-ink">
            Calories
          </h2>
        </div>
        <span className="rounded-full bg-sage/[0.12] px-3 py-1 text-[12px] font-semibold text-sage-600">
          {Math.round(PCT * 100)}% of goal
        </span>
      </div>

      <div className="flex items-center gap-10">
        <CalorieRing />
        <div className="flex flex-1 flex-col gap-4">
          {MACROS.map((m) => (
            <MacroBar key={m.label} {...m} />
          ))}
        </div>
      </div>
    </div>
  );
}
