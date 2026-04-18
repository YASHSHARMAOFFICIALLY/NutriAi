"use client";

import { useEffect, useState } from "react";
import { ArrowClockwise, Plus } from "@phosphor-icons/react/dist/ssr";
import { listMeals } from "@/lib/api/meals";
import type { MealDTO, MealType } from "@/lib/api/types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const MEAL_TYPE_META: Record<MealType, { label: string; tagColor: string }> = {
  BREAKFAST: { label: "Breakfast", tagColor: "bg-yellow-50 text-yellow-700" },
  LUNCH: { label: "Lunch", tagColor: "bg-sage/10 text-sage-600" },
  DINNER: { label: "Dinner", tagColor: "bg-forest/10 text-forest" },
  SNACK: { label: "Snack", tagColor: "bg-cream-2 text-ink-muted" },
};

function mealTitle(m: MealDTO): string {
  if (m.notes && m.notes.trim()) return m.notes.trim();
  if (m.items.length === 0) return MEAL_TYPE_META[m.mealType].label;
  if (m.items.length === 1) return m.items[0].name;
  return `${m.items[0].name} + ${m.items.length - 1} more`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-white/40" />
      ))}
    </div>
  );
}

export function TodayMeals() {
  const [meals, setMeals] = useState<MealDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMeals(todayISO());
      setMeals(data);
    } catch {
      setError("Couldn't load today's meals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[20px] font-bold text-ink">Meals today</h3>
        <a
          href="/snap"
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[13px] font-semibold text-cream transition-opacity hover:opacity-85"
        >
          <Plus size={13} weight="bold" />
          Log meal
        </a>
      </div>

      {loading && !meals && <Skeleton />}

      {error && !meals && (
        <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/50 px-5 py-4 text-[13px] text-ink-muted">
          <span>{error}</span>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1 text-[12px] font-medium transition-colors hover:border-sage/40 hover:text-sage-600"
          >
            <ArrowClockwise size={12} weight="bold" />
            Retry
          </button>
        </div>
      )}

      {meals && meals.length === 0 && (
        <a
          href="/snap"
          className="flex items-center justify-between rounded-2xl border border-dashed border-ink/10 px-5 py-6 text-ink-muted transition-colors hover:border-sage/40 hover:text-sage-600"
        >
          <div>
            <p className="text-[14px] font-medium">No meals logged yet</p>
            <p className="mt-0.5 text-[12px] text-ink-muted/70">Snap your first meal to start tracking.</p>
          </div>
          <Plus size={15} className="opacity-50" />
        </a>
      )}

      {meals && meals.length > 0 && (
        <div className="flex flex-col gap-2">
          {meals.map((meal) => {
            const meta = MEAL_TYPE_META[meal.mealType];
            return (
              <div
                key={meal.id}
                className="group flex items-center justify-between rounded-2xl border border-white/60 bg-white/50 px-5 py-4 backdrop-blur-sm transition-all duration-200 hover:border-white/80 hover:bg-white/70 hover:shadow-[0_4px_16px_rgba(31,59,45,0.06)]"
              >
                <div>
                  <p className="text-[14px] font-medium text-ink">{mealTitle(meal)}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{formatTime(meal.loggedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.tagColor}`}>
                    {meta.label}
                  </span>
                  <span className="font-display text-[15px] font-bold text-ink">
                    {Math.round(meal.totalCalories)}
                    <span className="ml-0.5 text-[11px] font-normal text-ink-muted">kcal</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
