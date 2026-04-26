"use client";

import { useEffect, useMemo, useState } from "react";
import { listHistory } from "@/lib/api/history";
import { deleteMeal, listMeals } from "@/lib/api/meals";
import type { HistoryEntry, MealDTO } from "@/lib/api/types";
import { PageHeader, MealLine, Panel, SourceBadge } from "../_components/ui";
import type { Meal } from "../_components/ui";

type DiaryMeal = Meal & { loggedDate: string };

function mealFromApi(meal: MealDTO): DiaryMeal {
  const loggedAt = new Date(meal.loggedAt);
  return {
    id: meal.id,
    mealType: meal.mealType,
    title: meal.notes || meal.items[0]?.name || meal.mealType.toLowerCase(),
    loggedAt: loggedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    loggedDate: loggedAt.toISOString().slice(0, 10),
    source: meal.foodQueryId ? "IMAGE" : "TEXT",
    provider: "db",
    cached: false,
    confidence: 1,
    totals: {
      calories: Math.round(meal.totalCalories),
      protein: Math.round(meal.totalProtein),
      carbs: Math.round(meal.totalCarbs),
      fat: Math.round(meal.totalFat),
    },
    items: meal.items.map((item) => ({
      name: item.name,
      quantity: item.quantity ?? "",
      calories: Math.round(item.calories),
      protein: Math.round(item.protein),
      carbs: Math.round(item.carbs),
      fat: Math.round(item.fat),
      confidence: 1,
    })),
  };
}

export default function MealsPage() {
  const [meals, setMeals] = useState<DiaryMeal[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState("Today");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [source, setSource] = useState<"loading" | "live" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listMeals(),
      listHistory({
        pageSize: 8,
        from: historyFrom || undefined,
        to: historyTo || undefined,
        minCalories: minCalories ? Number(minCalories) : undefined,
        maxCalories: maxCalories ? Number(maxCalories) : undefined,
      }).catch(() => ({ data: [], total: 0, page: 1, pageSize: 8, totalPages: 1 })),
    ])
      .then(([apiMeals, apiHistory]) => {
        if (cancelled) return;
        setMeals(apiMeals.map(mealFromApi));
        setHistory(apiHistory.data);
        setSource("live");
      })
      .catch(() => setSource("error"));
    return () => {
      cancelled = true;
    };
  }, [historyFrom, historyTo, maxCalories, minCalories]);

  const days = useMemo(() => {
    const groups = new Map<string, Meal[]>();
    const filtered = meals.filter((meal) => {
      if (activeFilter === "Breakfast" || activeFilter === "Lunch" || activeFilter === "Dinner") {
        return meal.mealType === activeFilter.toUpperCase();
      }
      if (activeFilter === "Photo source") return meal.source === "IMAGE";
      return true;
    });
    filtered.forEach((meal) => groups.set(meal.loggedDate, [...(groups.get(meal.loggedDate) ?? []), meal]));
    return Array.from(groups.entries()).map(([date, groupedMeals]) => ({ date, meals: groupedMeals }));
  }, [activeFilter, meals]);

  async function handleDeleteMeal(id: string) {
    const previous = meals;
    setMeals((current) => current.filter((meal) => meal.id !== id));
    try {
      await deleteMeal(id);
      setSource("live");
    } catch {
      setMeals(previous);
      setSource("error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Meals" title="Food diary" action={{ label: "Log meal", href: "/snap" }} />
      {source === "error" ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[#b7791f]">Could not load meal data. Sign in and try again.</p>
        </Panel>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        {["Today", "7 days", "30 days", "Breakfast", "Lunch", "Dinner", "Photo source"].map((filter) => (
          <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold ${activeFilter === filter ? "border-[#173c2b] bg-[#173c2b] text-white" : "border-black/10 bg-white text-[#5f675f]"}`}>
            {filter}
          </button>
        ))}
      </div>

      <section className="space-y-6">
        {days.map((day) => {
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
                  <h2 className="text-[22px] font-semibold">{day.date}</h2>
                  <p className="mt-1 text-[13px] text-[#5f675f]">{day.meals.length} meals · {totals.calories} kcal · {totals.protein}g protein</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SourceBadge label="editable items" />
                </div>
              </div>
              <div className="space-y-3 p-5">
                {day.meals.map((meal, index) => (
                  <MealLine
                    key={meal.id}
                    meal={meal}
                    expanded={index === 1}
                    action={
                      <button onClick={() => handleDeleteMeal(meal.id)} className="rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#b7791f]">
                        Delete
                      </button>
                    }
                  />
                ))}
              </div>
            </Panel>
          );
        })}
        {!days.length ? <Panel className="p-8 text-center"><p className="text-[15px] font-semibold text-[#5f675f]">No meals found for the current filters.</p></Panel> : null}
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
