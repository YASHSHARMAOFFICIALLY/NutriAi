"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { Camera } from "@phosphor-icons/react/dist/ssr";
import { listHistory } from "@/lib/api/history";
import { deleteMeal } from "@/lib/api/meals";
import type { HistoryEntry } from "@/lib/api/types";
import { useMeals, useMealsRange, useResource } from "@/lib/hooks/swr";
import { mealFromApi, type DiaryMeal } from "@/lib/mealAdapters";
import { todayKey, dateKeyToLocalDate, formatDayLabel } from "@/lib/date";
import { EmptyState, PageHeader, MealLine, Panel, Skeleton, SourceBadge, Stat } from "../_components/ui";
import type { Meal } from "../_components/ui";
import { useToast } from "@/lib/toast";

const RANGE_FILTERS = ["Today", "7 days", "30 days"] as const;
const TYPE_FILTERS = ["Breakfast", "Lunch", "Dinner", "Photo source"] as const;

type RangeFilter = (typeof RANGE_FILTERS)[number];
type TypeFilter = (typeof TYPE_FILTERS)[number];

function rangeStartKey(range: RangeFilter): string {
  const today = dateKeyToLocalDate(todayKey());
  const span = range === "30 days" ? 29 : 6;
  today.setDate(today.getDate() - span);
  return today.toLocaleDateString("en-CA");
}

export default function MealsPage() {
  const { toast } = useToast();
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("Today");
  const [typeFilter, setTypeFilter] = useState<TypeFilter | null>(null);
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");

  const today = todayKey();
  const isRange = rangeFilter !== "Today";
  const fromKey = isRange ? rangeStartKey(rangeFilter) : today;

  const todayResult = useMeals(undefined, { isPaused: () => isRange });
  const rangeResult = useMealsRange(fromKey, today, { isPaused: () => !isRange });
  const mealsResource = useResource(isRange ? rangeResult : todayResult);
  const mutateMeals = isRange ? rangeResult.mutate : todayResult.mutate;
  const mealsData = mealsResource.data;

  const defaultPaginated = { data: [] as HistoryEntry[], total: 0, page: 1, pageSize: 8, totalPages: 1 };
  const historyKey = `history:${historyFrom}:${historyTo}:${minCalories}:${maxCalories}`;
  const { data: historyData } = useSWR(historyKey, () =>
    listHistory({
      pageSize: 8,
      from: historyFrom || undefined,
      to: historyTo || undefined,
      minCalories: minCalories ? Number(minCalories) : undefined,
      maxCalories: maxCalories ? Number(maxCalories) : undefined,
    }).catch(() => defaultPaginated),
  );

  const meals = useMemo<DiaryMeal[]>(() => (mealsData ?? []).map(mealFromApi), [mealsData]);
  const history = historyData?.data ?? [];

  const days = useMemo(() => {
    const groups = new Map<string, Meal[]>();
    const filtered = meals.filter((meal) => {
      if (typeFilter === "Breakfast" || typeFilter === "Lunch" || typeFilter === "Dinner") {
        return meal.mealType === typeFilter.toUpperCase();
      }
      if (typeFilter === "Photo source") return meal.source === "IMAGE";
      return true;
    });
    filtered.forEach((meal) => groups.set(meal.loggedDate, [...(groups.get(meal.loggedDate) ?? []), meal]));
    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, groupedMeals]) => ({ date, meals: groupedMeals }));
  }, [typeFilter, meals]);

  const visibleTotals = useMemo(() => days.reduce(
    (acc, day) => {
      day.meals.forEach((meal) => {
        acc.meals += 1;
        acc.calories += meal.totals.calories;
        acc.protein += meal.totals.protein;
      });
      return acc;
    },
    { meals: 0, calories: 0, protein: 0 },
  ), [days]);

  async function handleDeleteMeal(id: string) {
    if (!window.confirm("Delete this meal from your diary?")) return;
    const previous = mealsData;
    await mutateMeals((current) => current?.filter((meal) => meal.id !== id), { revalidate: false });
    try {
      await deleteMeal(id);
      toast("success", "Meal deleted.");
      await Promise.all([
        mutateMeals(),
        // The daily summary is keyed by today; refresh it so the dashboard stays in sync.
        globalMutate(`daily-summary:${today}`),
      ]);
    } catch {
      await mutateMeals(previous, { revalidate: false });
      toast("error", "Could not delete meal.");
    }
  }

  const filtersActive =
    rangeFilter !== "Today" || typeFilter !== null || Boolean(historyFrom || historyTo || minCalories || maxCalories);

  function clearFilters() {
    setRangeFilter("Today");
    setTypeFilter(null);
    setHistoryFrom("");
    setHistoryTo("");
    setMinCalories("");
    setMaxCalories("");
  }

  const filterSummary = typeFilter ? `${rangeFilter} · ${typeFilter}` : rangeFilter;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="Meals"
        title="Food diary"
        description="Review saved meals, filter by time or meal type, and use analysis history to keep the diary accurate."
        action={{ label: "Log meal", href: "/snap" }}
      />
      {mealsResource.source === "error" ? (
        <Panel className="mb-5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-semibold text-[var(--danger)]">Could not load meal data. Check your connection and try again.</p>
            <button
              onClick={mealsResource.retry}
              className="min-h-10 shrink-0 rounded-lg bg-forest px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-forest-soft"
            >
              Retry
            </button>
          </div>
        </Panel>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible md:pb-0">
          {RANGE_FILTERS.map((filter) => (
            <button key={filter} onClick={() => setRangeFilter(filter)} className={`min-h-10 shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-colors ${rangeFilter === filter ? "border-[#173c2b] bg-[#173c2b] text-white" : "border-black/10 bg-white text-[#5f675f] hover:border-teal/30 hover:text-forest"}`}>
              {filter}
            </button>
          ))}
          <span className="mx-1 hidden w-px self-stretch bg-border md:block" aria-hidden />
          {TYPE_FILTERS.map((filter) => (
            <button key={filter} onClick={() => setTypeFilter((current) => (current === filter ? null : filter))} className={`min-h-10 shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-colors ${typeFilter === filter ? "border-teal bg-teal text-white" : "border-black/10 bg-white text-[#5f675f] hover:border-teal/30 hover:text-forest"}`}>
              {filter}
            </button>
          ))}
        </div>
        <button
          onClick={clearFilters}
          disabled={!filtersActive}
          className="min-h-10 rounded-lg border border-border bg-surface-alt px-3 py-2 text-[12px] font-bold text-forest transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset filters
        </button>
      </div>

      {mealsResource.source === "loading" ? (
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Panel className="p-5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-5 h-20" />
            <Skeleton className="mt-3 h-20" />
          </Panel>
        </div>
      ) : null}

      {mealsResource.source === "live" ? (
        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <Stat label="Visible meals" value={`${visibleTotals.meals}`} sub={`${filterSummary} filter`} />
          <Stat label="Calories" value={`${visibleTotals.calories}`} sub="In current view" />
          <Stat label="Protein" value={`${visibleTotals.protein}g`} sub="In current view" />
        </section>
      ) : null}

      <section className="space-y-6">
        {mealsResource.source === "live" && days.map((day) => {
          const totals = day.meals.reduce(
            (acc, meal) => ({
              calories: acc.calories + meal.totals.calories,
              protein: acc.protein + meal.totals.protein,
            }),
            { calories: 0, protein: 0 },
          );

          return (
            <Panel key={day.date} className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-black/10 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[22px] font-semibold">{formatDayLabel(day.date)}</h2>
                  <p className="mt-1 text-[13px] text-[#5f675f]">{day.meals.length} meals · {totals.calories} kcal · {totals.protein}g protein</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SourceBadge label="tap to expand" />
                </div>
              </div>
              <div className="space-y-3 p-3 sm:p-5">
                {day.meals.map((meal) => (
                  <MealLine
                    key={meal.id}
                    meal={meal}
                    action={
                      <button onClick={() => handleDeleteMeal(meal.id)} className="min-h-9 rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#b7791f] transition-colors hover:border-[#b7791f]/30 hover:bg-amber-50">
                        Delete
                      </button>
                    }
                  />
                ))}
              </div>
            </Panel>
          );
        })}
        {mealsResource.source === "live" && !days.length ? (
          <Panel className="p-6">
            <EmptyState
              icon={Camera}
              title={meals.length ? "No meals match this filter" : "No meals logged yet"}
              description={meals.length ? "Try a wider date range or clear the meal type filter." : "Start with a photo scan or text description to build your diary history."}
              action={meals.length ? undefined : { label: "Scan meal", href: "/snap" }}
            />
            {meals.length ? (
              <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button onClick={clearFilters} className="rounded-lg border border-black/10 bg-white px-4 py-3 text-[13px] font-bold text-[#173c2b]">
                Reset filters
              </button>
              <Link href="/snap" className="rounded-lg bg-[#173c2b] px-4 py-3 text-[13px] font-bold text-white">
                Scan meal
              </Link>
            </div>
            ) : null}
          </Panel>
        ) : null}
      </section>

      <Panel className="mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-black/10 p-5">
          <div>
            <h2 className="text-[22px] font-semibold">Analysis history</h2>
            <p className="mt-1 text-[13px] text-[#5f675f]">Recent food checks and saved nutrition estimates.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={historyFrom} onChange={(event) => setHistoryFrom(event.target.value)} className="rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2 text-[12px] font-bold outline-none" />
            <input type="date" value={historyTo} onChange={(event) => setHistoryTo(event.target.value)} className="rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2 text-[12px] font-bold outline-none" />
            <input inputMode="numeric" value={minCalories} onChange={(event) => setMinCalories(event.target.value)} placeholder="Min kcal" className="w-24 rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2 text-[12px] font-bold outline-none" />
            <input inputMode="numeric" value={maxCalories} onChange={(event) => setMaxCalories(event.target.value)} placeholder="Max kcal" className="w-24 rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2 text-[12px] font-bold outline-none" />
            <SourceBadge label={history.length ? `${history.length} recent` : "empty"} />
          </div>
        </div>
        <div className="divide-y divide-black/8">
          {(history.length ? history : []).map((entry) => (
            <div key={entry.id} className="grid gap-3 p-5 md:grid-cols-[1fr_260px] md:items-center">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <SourceBadge label={entry.inputType.toLowerCase()} />
                  <SourceBadge label={`${Math.round(entry.confidence * 100)}% confidence`} />
                </div>
                <p className="text-[15px] font-semibold">{entry.inputText || entry.items.map((item) => item.name).slice(0, 3).join(", ") || "Image analysis"}</p>
                <p className="mt-1 text-[12px] text-[#5f675f]">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  [Math.round(entry.totals.calories), "kcal"],
                  [`${Math.round(entry.totals.protein)}g`, "protein"],
                  [`${Math.round(entry.totals.carbs)}g`, "carbs"],
                  [`${Math.round(entry.totals.fat)}g`, "fat"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md bg-[#f8f8f3] p-2">
                    <p className="text-[13px] font-semibold">{value}</p>
                    <p className="text-[10px] text-[#5f675f]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!history.length ? (
            <div className="p-5 text-[13px] font-semibold text-[#5f675f]">No food analysis history yet. Analyze a meal from Snap to populate this section.</div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
