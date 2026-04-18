"use client";

import { motion } from "motion/react";
import { Check, ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface AnalysisResult {
  name: string;
  totalKcal: number;
  confidence: number;
  macros: { label: string; value: string; color: string }[];
  items: { name: string; weight: string; kcal: number }[];
}

export const MOCK_RESULT: AnalysisResult = {
  name: "Grain bowl with salmon",
  totalKcal: 486,
  confidence: 98,
  macros: [
    { label: "Protein", value: "34g", color: "text-sage-600 bg-sage/10" },
    { label: "Carbs",   value: "42g", color: "text-forest bg-forest/8" },
    { label: "Fat",     value: "18g", color: "text-ink bg-ink/5" },
    { label: "Fiber",   value: "7g",  color: "text-sage bg-sage/8" },
  ],
  items: [
    { name: "Salmon fillet",       weight: "85g",  kcal: 180 },
    { name: "Brown rice",          weight: "120g", kcal: 160 },
    { name: "Mixed greens",        weight: "40g",  kcal: 30  },
    { name: "Extra virgin olive oil", weight: "12ml", kcal: 116 },
  ],
};

interface Props {
  result: AnalysisResult;
  onLog: () => void;
  onReset: () => void;
  logging?: boolean;
  error?: string | null;
}

export function ResultCard({ result, onLog, onReset, logging = false, error }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col gap-4"
    >
      {/* Main card */}
      <div className="rounded-3xl border border-white/70 bg-white/60 shadow-[0_10px_40px_rgba(31,59,45,0.07),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7 pb-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sage-600">
              Detected
            </p>
            <h2 className="mt-1 font-display text-[22px] font-bold leading-tight text-ink">
              {result.name}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="font-display text-[36px] font-bold leading-none text-ink">
              {result.totalKcal}
            </span>
            <span className="text-[12px] text-ink-muted">kcal total</span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mx-7 mb-5">
          <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1.5">
            <span>Confidence</span>
            <span className="font-semibold text-sage-600">{result.confidence}% match</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-ink/[0.06]">
            <motion.div
              className="h-full rounded-full bg-sage"
              style={{ transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: result.confidence / 100 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Macro pills */}
        <div className="grid grid-cols-4 gap-2 px-7 pb-6">
          {result.macros.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.15 + i * 0.07 }}
              className={`flex flex-col items-center rounded-xl py-3 ${m.color}`}
            >
              <span className="font-display text-[18px] font-bold leading-none">
                {m.value}
              </span>
              <span className="mt-1 text-[10px] font-medium opacity-70">{m.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-ink/[0.05]" />

        {/* Food items */}
        <div className="flex flex-col divide-y divide-ink/[0.04]">
          {result.items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: 0.3 + i * 0.06 }}
              className="flex items-center justify-between px-7 py-3.5"
            >
              <div>
                <p className="text-[14px] font-medium text-ink">{item.name}</p>
                <p className="text-[11px] text-ink-muted">{item.weight}</p>
              </div>
              <span className="font-display text-[15px] font-bold text-ink">
                {item.kcal}
                <span className="ml-0.5 text-[11px] font-normal text-ink-muted">kcal</span>
              </span>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.5 }}
        className="flex flex-col gap-2"
      >
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] text-red-700">
            {error}
          </p>
        )}
        <button
          onClick={onLog}
          disabled={logging}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest py-4 text-[15px] font-semibold text-cream shadow-[0_4px_20px_rgba(31,59,45,0.25)] transition-all hover:opacity-90 hover:shadow-[0_8px_30px_rgba(31,59,45,0.32)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check size={16} weight="bold" />
          {logging ? "Logging…" : "Log this meal"}
        </button>
        <button
          onClick={onReset}
          disabled={logging}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-medium text-ink-muted transition-colors hover:bg-ink/[0.04] hover:text-ink disabled:opacity-60"
        >
          <ArrowCounterClockwise size={15} />
          Try again
        </button>
      </motion.div>
    </motion.div>
  );
}
