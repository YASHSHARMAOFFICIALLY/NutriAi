"use client";

import { motion } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// 4 weeks × 7 days of mock data: 0 = missed, 1 = partial, 2 = full
const WEEKS: number[][] = [
  [2, 2, 1, 2, 2, 0, 2],
  [2, 1, 2, 2, 0, 2, 2],
  [2, 2, 2, 1, 2, 2, 0],
  [2, 2, 1, 2, 2, 2, 1],
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const COLOR: Record<number, string> = {
  0: "bg-ink/[0.05]",
  1: "bg-sage/40",
  2: "bg-forest",
};

const LABEL: Record<number, string> = {
  0: "No log",
  1: "Partial",
  2: "Fully logged",
};

export function LogHeatmap() {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_4px_20px_rgba(31,59,45,0.05)] backdrop-blur-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Last 4 weeks
          </p>
          <h3 className="mt-1 font-display text-[20px] font-bold text-ink">Logging streak</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-ink-muted">
          {[0, 1, 2].map((v) => (
            <span key={v} className="flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-sm ${COLOR[v]}`} />
              {LABEL[v]}
            </span>
          ))}
        </div>
      </div>

      {/* Day labels */}
      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {DAYS.map((d) => (
          <p key={d} className="text-center text-[10px] text-ink-muted/60">{d}</p>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-1.5">
        {WEEKS.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((val, di) => {
              const idx = wi * 7 + di;
              return (
                <motion.div
                  key={di}
                  title={LABEL[val]}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: EASE, delay: 0.05 + idx * 0.012 }}
                  className={`aspect-square rounded-md ${COLOR[val]}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center gap-1.5 text-[12px] text-ink-muted">
        <span className="font-semibold text-forest">24 of 28 days</span>
        logged this month — keep it up!
      </div>
    </div>
  );
}
