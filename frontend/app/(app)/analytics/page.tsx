"use client";

import { motion } from "framer-motion";
import { TrendUp, Lightning, ForkKnife, Flame } from "@phosphor-icons/react/dist/ssr";
import { WeeklyChart } from "./_components/WeeklyChart";
import { MacroRing } from "./_components/MacroRing";
import { LogHeatmap } from "./_components/LogHeatmap";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATS = [
  {
    label: "Avg daily kcal",
    value: "1,706",
    sub: "vs 1,800 goal",
    icon: <TrendUp size={16} weight="fill" className="text-sage-600" />,
    bg: "bg-sage/10",
  },
  {
    label: "Current streak",
    value: "12",
    sub: "days in a row",
    icon: <Flame size={16} weight="fill" className="text-orange-500" />,
    bg: "bg-orange-50",
  },
  {
    label: "Meals logged",
    value: "68",
    sub: "this month",
    icon: <ForkKnife size={16} weight="fill" className="text-forest" />,
    bg: "bg-forest/10",
  },
  {
    label: "Avg protein",
    value: "94g",
    sub: "vs 130g goal",
    icon: <Lightning size={16} weight="fill" className="text-sage-600" />,
    bg: "bg-sage/10",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Header */}
      <header className="mb-10">
        <p className="text-[13px] text-ink-muted">Your progress</p>
        <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
          Analytics
        </h1>
      </header>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.07 }}
            className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-[0_4px_20px_rgba(31,59,45,0.05)] backdrop-blur-sm"
          >
            <div className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl ${s.bg}`}>
              {s.icon}
            </div>
            <p className="font-display text-[28px] font-bold leading-none text-ink">{s.value}</p>
            <p className="mt-1 text-[11px] font-medium text-ink-muted">{s.label}</p>
            <p className="text-[10px] text-ink-muted/60">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
        {/* Weekly chart — full width on left */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.28 }}
        >
          <WeeklyChart />
        </motion.div>

        {/* Macro ring */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.35 }}
        >
          <MacroRing />
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.42 }}
        className="mt-6"
      >
        <LogHeatmap />
      </motion.div>
    </div>
  );
}
