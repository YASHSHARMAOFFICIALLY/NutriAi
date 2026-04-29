"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CrownSimple, FunnelSimple, Lock, Star } from "@phosphor-icons/react/dist/ssr";
import { getDailySummary } from "@/lib/api/meals";
import { getMyPlan } from "@/lib/api/payments";
import { getProfile } from "@/lib/api/profile";
import { getMealRecommendations } from "@/lib/api/recommendations";
import type { MealRecommendation, MealType } from "@/lib/api/types";
import { PageHeader, Panel, Skeleton, SourceBadge } from "../_components/ui";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function safeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export default function RecommendationsPage() {
  const [items, setItems] = useState<MealRecommendation[]>([]);
  const [remaining, setRemaining] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [allergies, setAllergies] = useState<string[]>([]);
  const [mealType, setMealType] = useState<MealType>("DINNER");
  const [isPro, setIsPro] = useState(false);
  const [source, setSource] = useState<"loading" | "live" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProfile().catch(() => null),
      getDailySummary(todayISO()).catch(() => null),
      getMyPlan().catch(() => null),
    ])
      .then(async ([apiProfile, daily, apiPlan]) => {
        if (cancelled) return;
        setIsPro(apiPlan?.tier === "PRO" && (apiPlan.status === "ACTIVE" || apiPlan.status === "PAST_DUE"));
        const targets = {
          calories: apiProfile?.dailyCalorieTarget ?? 0,
          protein: apiProfile?.proteinTargetG ?? 0,
          carbs: apiProfile?.carbsTargetG ?? 0,
          fat: apiProfile?.fatTargetG ?? 0,
        };
        const budget = {
          calories: Math.max(0, targets.calories - (daily?.totalCalories ?? 0)),
          protein: Math.max(0, targets.protein - (daily?.totalProtein ?? 0)),
          carbs: Math.max(0, targets.carbs - (daily?.totalCarbs ?? 0)),
          fat: Math.max(0, targets.fat - (daily?.totalFat ?? 0)),
        };
        const recs = await getMealRecommendations({
          mealType,
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
        setAllergies(apiProfile?.allergies ?? []);
        setItems(recs.recommendations);
        setSource("live");
      })
      .catch(() => setSource("error"));
    return () => {
      cancelled = true;
    };
  }, [mealType]);

  const rows = useMemo(() => {
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
  }, [items]);

  function handleMealTypeChange(nextMealType: MealType) {
    if (nextMealType === mealType) return;
    setSource("loading");
    setMealType(nextMealType);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow="Next meal"
        title="Ideas from your own history"
        description="Suggestions are ranked against what is left today, your saved profile, and meals you already like."
        action={{ label: "Ask Ria", href: "/coach" }}
      />
      {source === "error" ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[#b7791f]">Could not load recommendations. Sign in and try again.</p>
        </Panel>
      ) : null}

      <Panel className="mb-5 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0f8b8d]">Remaining budget</p>
            <h2 className="mt-1 text-[26px] font-semibold">{mealType.toLowerCase()} ideas are matched against what is left today.</h2>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              [remaining.calories, "kcal"],
              [`${remaining.protein}g`, "protein"],
              [`${remaining.carbs}g`, "carbs"],
              [`${remaining.fat}g`, "fat"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md bg-[#f8f8f3] p-3">
                <p className="font-semibold">{typeof value === "number" ? safeNumber(value) : value}</p>
                <p className="text-[11px] text-[#5f675f]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {!isPro && source !== "loading" ? (
        <Panel className="mb-5 overflow-hidden border-[#d7ff68]/50">
          <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-teal">
                <Lock size={15} weight="bold" />
                Pro preview
              </div>
              <h2 className="text-[22px] font-bold text-forest">Unlock ranked meal ideas when your diary has enough signal.</h2>
              <p className="mt-2 text-[13px] leading-6 text-muted">
                Free users can still log meals and view the diary. Pro adds personalized ranking, larger history matching, coach context, and family-aware progress.
              </p>
            </div>
            <div className="border-t border-border bg-forest p-5 text-white lg:border-l lg:border-t-0">
              <div className="mb-3 flex items-center gap-2 text-[#d7ff68]">
                <CrownSimple size={18} weight="fill" />
                <span className="text-[12px] font-bold uppercase tracking-[0.14em]">Sample insight</span>
              </div>
              <p className="text-[15px] font-bold">Dinner should bias protein and keep calories moderate.</p>
              <Link href="/pricing" className="mt-5 inline-flex rounded-lg bg-[#d7ff68] px-4 py-2.5 text-[13px] font-bold text-forest">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </Panel>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        {(["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => handleMealTypeChange(filter)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-colors ${mealType === filter ? "border-[#173c2b] bg-[#173c2b] text-white" : "border-black/10 bg-white text-[#5f675f] hover:border-teal/30 hover:text-forest"}`}
          >
            {mealType === filter ? <FunnelSimple size={13} weight="fill" /> : null}
            {filter.toLowerCase()}
          </button>
        ))}
        {["Fits calories", "Protein gap", "Not eaten recently", allergies[0] ? `Avoids ${allergies[0]}` : "Uses saved profile"].map((filter) => (
          <span key={filter} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[12px] font-bold text-[#5f675f]">
            {filter}
          </span>
        ))}
      </div>

      <section className="space-y-3">
        {source === "loading" ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </>
        ) : null}
        {source !== "loading" && !rows.length ? (
          <Panel className="p-8 text-center">
            <h2 className="text-[24px] font-bold text-forest">Log more {mealType.toLowerCase()} meals to unlock recommendations.</h2>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#5f675f]">
              Saved meals help NutriAI rank familiar options, respect your profile, and match the remaining budget for today.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/snap" className="inline-flex rounded-md bg-[#173c2b] px-5 py-3 text-[14px] font-bold text-white">
                Scan meal
              </Link>
              <Link href="/meals" className="inline-flex rounded-md border border-black/10 bg-white px-5 py-3 text-[14px] font-bold text-[#173c2b]">
                Open diary
              </Link>
            </div>
          </Panel>
        ) : null}
        {source !== "loading" && rows.map((rec, index) => (
          <Panel key={rec.signature} className={index === 0 ? "border-[#173c2b] ring-2 ring-[#d7ff68]" : ""}>
            <div className="grid gap-4 p-5 xl:grid-cols-[1fr_220px_150px] xl:items-center">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <SourceBadge label={rec.mealType.toLowerCase()} />
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
