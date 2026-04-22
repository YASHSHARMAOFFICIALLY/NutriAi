"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FunnelSimple, Star } from "@phosphor-icons/react/dist/ssr";
import { getDailySummary } from "@/lib/api/meals";
import { getProfile } from "@/lib/api/profile";
import { getMealRecommendations } from "@/lib/api/recommendations";
import type { MealRecommendation } from "@/lib/api/types";
import { profile, recommendations, remaining as fallbackRemaining } from "../_components/mock-data";
import { PageHeader, Panel, SourceBadge } from "../_components/ui";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RecommendationsPage() {
  const [items, setItems] = useState<MealRecommendation[]>([]);
  const [remaining, setRemaining] = useState(fallbackRemaining);
  const [allergies, setAllergies] = useState(profile.allergies);
  const [source, setSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProfile().catch(() => null),
      getDailySummary(todayISO()).catch(() => null),
    ])
      .then(async ([apiProfile, daily]) => {
        if (cancelled) return;
        const targets = {
          calories: apiProfile?.dailyCalorieTarget ?? profile.targets.calories,
          protein: apiProfile?.proteinTargetG ?? profile.targets.protein,
          carbs: apiProfile?.carbsTargetG ?? profile.targets.carbs,
          fat: apiProfile?.fatTargetG ?? profile.targets.fat,
        };
        const budget = {
          calories: Math.max(0, targets.calories - (daily?.totalCalories ?? 0)),
          protein: Math.max(0, targets.protein - (daily?.totalProtein ?? 0)),
          carbs: Math.max(0, targets.carbs - (daily?.totalCarbs ?? 0)),
          fat: Math.max(0, targets.fat - (daily?.totalFat ?? 0)),
        };
        const recs = await getMealRecommendations({
          mealType: "DINNER",
          limit: 6,
          remainingCalories: budget.calories,
          remainingProtein: budget.protein,
          remainingCarbs: budget.carbs,
          remainingFat: budget.fat,
        });
        if (cancelled) return;
        setRemaining({
          calories: recs.remaining.calories ?? budget.calories,
          protein: recs.remaining.protein ?? budget.protein,
          carbs: recs.remaining.carbs ?? budget.carbs,
          fat: recs.remaining.fat ?? budget.fat,
        });
        setAllergies(apiProfile?.allergies?.length ? apiProfile.allergies : profile.allergies);
        setItems(recs.recommendations);
        setSource("live");
      })
      .catch(() => setSource("fallback"));
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (!items.length && source === "live") return [];
    if (!items.length) return recommendations;
    return items.map((rec, index) => ({
      signature: rec.signature || `${rec.sampleMealId}-${index}`,
      mealType: rec.mealType,
      title: rec.items.map((item) => item.name).join(", "),
      score: rec.score,
      frequency: rec.frequency,
      lastLoggedAt: new Date(rec.lastLoggedAt).toLocaleDateString(),
      reasons: rec.reasons.length ? rec.reasons : ["fits your remaining targets"],
      totals: rec.totals,
      items: rec.items.map((item) => item.name),
    }));
  }, [items, source]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Recommendations" title="Ranked from your meal history" action={{ label: "Ask Ria", href: "/coach" }} />

      <Panel className="mb-5 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0f8b8d]">Remaining budget · {source}</p>
            <h2 className="mt-1 text-[26px] font-semibold">Dinner candidates are scored against what is left today.</h2>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              [remaining.calories, "kcal"],
              [`${remaining.protein}g`, "protein"],
              [`${remaining.carbs}g`, "carbs"],
              [`${remaining.fat}g`, "fat"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md bg-[#f8f8f3] p-3">
                <p className="font-semibold">{value}</p>
                <p className="text-[11px] text-[#5f675f]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className="mb-5 flex flex-wrap gap-2">
        {["Dinner", "Fits calories", "Protein gap", "Not eaten recently", `Avoids ${allergies[0] ?? "allergies"}`].map((filter, index) => (
          <button key={filter} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-bold ${index === 0 ? "border-[#173c2b] bg-[#173c2b] text-white" : "border-black/10 bg-white text-[#5f675f]"}`}>
            {index === 0 ? <FunnelSimple size={13} weight="fill" /> : null}
            {filter}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {!rows.length ? (
          <Panel className="p-8 text-center">
            <h2 className="text-[26px] font-semibold">Log 3 meals to unlock history-based recommendations.</h2>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#5f675f]">
              The recommendation engine ranks repeat meals from your history, excludes allergies, and scores against the remaining budget. It needs saved meals before it can personalize dinner.
            </p>
            <Link href="/snap" className="mt-5 inline-flex rounded-md bg-[#173c2b] px-5 py-3 text-[14px] font-bold text-white">
              Analyze a meal
            </Link>
          </Panel>
        ) : null}
        {rows.map((rec, index) => (
          <Panel key={rec.signature} className={index === 0 ? "border-[#173c2b] ring-2 ring-[#d7ff68]" : ""}>
            <div className="grid gap-4 p-5 xl:grid-cols-[1fr_220px_150px] xl:items-center">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <SourceBadge label={rec.mealType.toLowerCase()} />
                  <SourceBadge label={source} />
                  <SourceBadge label={rec.frequency ? `${rec.frequency}x logged` : "new fit"} />
                  {index === 0 ? <SourceBadge label="best fit" /> : null}
                </div>
                <h2 className="text-[24px] font-semibold">{rec.title}</h2>
                <p className="mt-2 text-[13px] text-[#5f675f]">{rec.items.join(" · ")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rec.reasons.map((reason) => (
                    <span key={reason} className="rounded-full bg-[#eef5f2] px-2.5 py-1 text-[11px] font-bold text-[#173c2b]">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center xl:grid-cols-2">
                {[
                  [rec.totals.calories, "kcal"],
                  [`${rec.totals.protein}g`, "protein"],
                  [`${rec.totals.carbs}g`, "carbs"],
                  [`${rec.totals.fat}g`, "fat"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md bg-[#f8f8f3] p-2">
                    <p className="text-[14px] font-semibold">{value}</p>
                    <p className="text-[10px] text-[#5f675f]">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 xl:block xl:text-right">
                <div>
                  <p className="flex items-center gap-1 text-[28px] font-semibold xl:justify-end">
                    <Star size={20} weight="fill" className="text-[#b7791f]" />
                    {Math.round(rec.score * 100)}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f675f]">score</p>
                </div>
                <Link href="/snap" className="rounded-md bg-[#173c2b] px-4 py-2.5 text-[13px] font-bold text-white xl:mt-4 xl:inline-block">
                  Log again
                </Link>
              </div>
            </div>
          </Panel>
        ))}
      </section>
    </div>
  );
}
