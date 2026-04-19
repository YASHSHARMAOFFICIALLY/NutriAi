"use client";

import { motion } from "framer-motion";
import { Camera, TextT } from "@phosphor-icons/react/dist/ssr";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface Meal {
  id: string;
  name: string;
  time: string;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "photo" | "text";
}

const TYPE_STYLE: Record<Meal["type"], string> = {
  Breakfast: "bg-amber-50 text-amber-700",
  Lunch:     "bg-sage/10 text-sage-600",
  Dinner:    "bg-forest/10 text-forest",
  Snack:     "bg-ink/[0.05] text-ink-muted",
};

export function MealCard({ meal, index }: { meal: Meal; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: index * 0.06 }}
      className="group flex items-center justify-between rounded-2xl border border-white/70 bg-white/60 px-5 py-4 shadow-[0_2px_12px_rgba(31,59,45,0.04)] backdrop-blur-sm transition-all hover:border-white/90 hover:bg-white/80 hover:shadow-[0_4px_20px_rgba(31,59,45,0.08)]"
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Source icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink/[0.04]">
          {meal.source === "photo"
            ? <Camera size={16} className="text-ink-muted" />
            : <TextT size={16} className="text-ink-muted" />
          }
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-ink">{meal.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_STYLE[meal.type]}`}>
              {meal.type}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-ink-muted">{meal.time}</p>
        </div>
      </div>

      {/* Macros + kcal */}
      <div className="flex items-center gap-6 text-right">
        <div className="hidden gap-4 sm:flex">
          {[
            { label: "P", val: meal.protein },
            { label: "C", val: meal.carbs },
            { label: "F", val: meal.fat },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center">
              <span className="font-display text-[14px] font-bold text-ink">{m.val}g</span>
              <span className="text-[10px] text-ink-muted">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="w-16 text-right">
          <span className="font-display text-[18px] font-bold text-ink">{meal.kcal}</span>
          <p className="text-[10px] text-ink-muted">kcal</p>
        </div>
      </div>
    </motion.div>
  );
}
