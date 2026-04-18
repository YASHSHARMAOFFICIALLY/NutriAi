"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { DayGroup } from "./_components/DayGroup";
import type { Meal } from "./_components/MealCard";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Filter = "today" | "week" | "month";

const ALL_MEALS: { label: string; meals: Meal[] }[] = [
  {
    label: "Today",
    meals: [
      { id: "1", name: "Greek yogurt bowl", time: "8:14 AM",  type: "Breakfast", kcal: 320, protein: 22, carbs: 38, fat: 8,  source: "text"  },
      { id: "2", name: "Grilled chicken wrap", time: "12:40 PM", type: "Lunch",  kcal: 480, protein: 38, carbs: 44, fat: 12, source: "photo" },
      { id: "3", name: "Almonds",           time: "3:22 PM",  type: "Snack",     kcal: 180, protein: 6,  carbs: 7,  fat: 16, source: "text"  },
    ],
  },
  {
    label: "Yesterday",
    meals: [
      { id: "4", name: "Oatmeal with banana", time: "7:50 AM",  type: "Breakfast", kcal: 360, protein: 12, carbs: 62, fat: 7,  source: "text"  },
      { id: "5", name: "Grain bowl with salmon", time: "1:10 PM", type: "Lunch", kcal: 486, protein: 34, carbs: 42, fat: 18, source: "photo" },
      { id: "6", name: "Protein shake",     time: "4:00 PM",  type: "Snack",     kcal: 220, protein: 28, carbs: 14, fat: 4,  source: "text"  },
      { id: "7", name: "Pasta primavera",   time: "7:30 PM",  type: "Dinner",    kcal: 580, protein: 18, carbs: 82, fat: 16, source: "photo" },
    ],
  },
  {
    label: "Saturday, Apr 16",
    meals: [
      { id: "8",  name: "Avocado toast",    time: "9:00 AM",  type: "Breakfast", kcal: 290, protein: 10, carbs: 28, fat: 16, source: "photo" },
      { id: "9",  name: "Caesar salad",     time: "1:30 PM",  type: "Lunch",     kcal: 420, protein: 14, carbs: 32, fat: 26, source: "text"  },
      { id: "10", name: "Steak with rice",  time: "7:00 PM",  type: "Dinner",    kcal: 660, protein: 48, carbs: 54, fat: 22, source: "photo" },
    ],
  },
];

const FILTER_COUNTS: Record<Filter, number> = { today: 1, week: 3, month: 3 };

const TABS: { id: Filter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week",  label: "This week" },
  { id: "month", label: "This month" },
];

export default function MealsPage() {
  const [filter, setFilter] = useState<Filter>("week");

  const visible = ALL_MEALS.slice(0, FILTER_COUNTS[filter]);
  let cardIndex = 0;

  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-[13px] text-ink-muted">Your food diary</p>
          <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
            Meals
          </h1>
        </div>
        <Link
          href="/snap"
          className="flex items-center gap-2 rounded-2xl bg-forest px-5 py-3 text-[14px] font-semibold text-cream shadow-[0_4px_20px_rgba(31,59,45,0.25)] transition-all hover:opacity-90 active:scale-[0.99]"
        >
          <Plus size={15} weight="bold" />
          Log meal
        </Link>
      </header>

      {/* Filter tabs */}
      <div className="mb-6 flex self-start rounded-full border border-ink/[0.08] bg-white/60 p-1 backdrop-blur-sm w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={[
              "rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200",
              filter === t.id
                ? "bg-forest text-cream shadow-[0_2px_8px_rgba(31,59,45,0.2)]"
                : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Meal groups */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex flex-col gap-8"
        >
          {visible.map((group) => {
            const start = cardIndex;
            cardIndex += group.meals.length;
            return (
              <DayGroup
                key={group.label}
                label={group.label}
                meals={group.meals}
                totalKcal={group.meals.reduce((s, m) => s + m.kcal, 0)}
                startIndex={start}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
