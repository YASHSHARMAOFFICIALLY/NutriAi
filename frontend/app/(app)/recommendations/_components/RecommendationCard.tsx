"use client";

import { motion } from "framer-motion";
import { Sparkle, Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface Recommendation {
  id: string;
  name: string;
  reason: string;
  tag: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
}

const TAG_STYLE: Record<string, string> = {
  "High Protein": "bg-sage/10 text-sage-600",
  "Low Cal":      "bg-forest/10 text-forest",
  "Quick":        "bg-amber-50 text-amber-700",
  "Balanced":     "bg-ink/[0.05] text-ink-muted",
};

export function RecommendationCard({
  rec,
  index,
}: {
  rec: Recommendation;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: EASE, delay: index * 0.07 }}
      className="group flex flex-col rounded-2xl border border-white/70 bg-white/60 p-5 shadow-[0_4px_16px_rgba(31,59,45,0.05)] backdrop-blur-sm transition-all hover:border-white/90 hover:bg-white/80 hover:shadow-[0_8px_28px_rgba(31,59,45,0.09)]"
    >
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${TAG_STYLE[rec.tag] ?? "bg-ink/[0.05] text-ink-muted"}`}>
              {rec.tag}
            </span>
            <span className="text-[11px] text-ink-muted">{rec.prepTime}</span>
          </div>
          <h3 className="text-[15px] font-semibold text-ink">{rec.name}</h3>
        </div>
        <div className="text-right shrink-0">
          <span className="font-display text-[20px] font-bold leading-none text-ink">{rec.kcal}</span>
          <p className="text-[10px] text-ink-muted">kcal</p>
        </div>
      </div>

      {/* Ria's reason */}
      <div className="mb-4 flex items-start gap-2 rounded-xl bg-sage/[0.07] px-3 py-2.5">
        <Sparkle size={12} weight="fill" className="mt-0.5 shrink-0 text-sage-600" />
        <p className="text-[12px] leading-relaxed text-ink-muted">{rec.reason}</p>
      </div>

      {/* Macros */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "Protein", val: rec.protein },
          { label: "Carbs",   val: rec.carbs },
          { label: "Fat",     val: rec.fat },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-ink/[0.03] py-2 text-center">
            <p className="font-display text-[15px] font-bold text-ink">{m.val}g</p>
            <p className="text-[9px] text-ink-muted">{m.label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/snap"
        className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-ink/[0.08] py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-forest/30 hover:bg-forest/[0.04] hover:text-forest"
      >
        <Plus size={13} weight="bold" />
        Log this meal
      </Link>
    </motion.div>
  );
}
