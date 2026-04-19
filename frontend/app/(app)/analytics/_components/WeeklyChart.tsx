"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const DAYS = [
  { day: "Mon", kcal: 1640 },
  { day: "Tue", kcal: 1820 },
  { day: "Wed", kcal: 1550 },
  { day: "Thu", kcal: 1910 },
  { day: "Fri", kcal: 1730 },
  { day: "Sat", kcal: 2050 },
  { day: "Sun", kcal: 1240, today: true },
];

const GOAL = 1800;
const MAX = 2200;

export function WeeklyChart() {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_4px_20px_rgba(31,59,45,0.05)] backdrop-blur-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            This week
          </p>
          <h3 className="mt-1 font-display text-[20px] font-bold text-ink">Calorie intake</h3>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-forest" />
            Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sage/60" />
            Logged
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 border-t border-dashed border-ink-muted/40" />
            Goal
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative pt-2">
        {/* Goal line */}
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-ink-muted/25"
          style={{ bottom: `${(GOAL / MAX) * 160}px` }}
        >
          <span className="absolute -top-4 right-0 text-[10px] text-ink-muted/50">
            {GOAL} kcal
          </span>
        </div>

        {/* Bars */}
        <div className="flex h-40 items-end gap-2">
          {DAYS.map((d, i) => {
            const h = (d.kcal / MAX) * 160;
            return (
              <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-col items-center justify-end" style={{ height: 160 }}>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-[10px] font-medium text-cream opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                    {d.kcal} kcal
                  </div>
                  <motion.div
                    className={`w-full rounded-t-xl ${d.today ? "bg-forest shadow-[0_4px_16px_rgba(31,59,45,0.25)]" : "bg-sage/40 group-hover:bg-sage/60"} transition-colors duration-200`}
                    style={{ height: h }}
                    initial={{ scaleY: 0, originY: 1 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.07 }}
                  />
                </div>
                <span className={`text-[11px] ${d.today ? "font-semibold text-forest" : "text-ink-muted"}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
