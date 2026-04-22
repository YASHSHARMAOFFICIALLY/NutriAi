"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import { Camera, ChatCircleText, Clock, Star, Trophy } from "@phosphor-icons/react/dist/ssr";
import { getStreak } from "@/lib/api/analytics";
import { listMyChallenge } from "@/lib/api/challenges";
import { getDailySummary, listMeals } from "@/lib/api/meals";
import { getProfile } from "@/lib/api/profile";
import { getMealRecommendations } from "@/lib/api/recommendations";
import type { MealDTO, MealRecommendation, UserChallengeDTO } from "@/lib/api/types";
import { analytics, challenge, profile, recommendations, summary, todayMeals } from "../_components/mock-data";
import type { Meal } from "../_components/mock-data";
import { BudgetBar, MealLine, PageHeader, Panel, Stat } from "../_components/ui";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function mealFromApi(meal: MealDTO): Meal {
  return {
    id: meal.id,
    mealType: meal.mealType,
    title: meal.notes || meal.items[0]?.name || meal.mealType.toLowerCase(),
    loggedAt: new Date(meal.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

export default function DashboardPage() {
  const [meals, setMeals] = useState<Meal[]>(todayMeals);
  const [totals, setTotals] = useState(summary.totals);
  const [targets, setTargets] = useState(profile.targets);
  const [streak, setStreak] = useState(analytics.streak.loggingStreak);
  const [activeChallenge, setActiveChallenge] = useState<UserChallengeDTO | null>(null);
  const [liveRec, setLiveRec] = useState<MealRecommendation | null>(null);
  const [source, setSource] = useState<"live" | "fallback">("fallback");

  const actions: Array<{ href: string; label: string; icon: ElementType }> = [
    { href: "/snap", label: "Analyze food", icon: Camera },
    { href: "/recommendations", label: "Pick from history", icon: Star },
    { href: "/coach", label: "Ask Coach Ria", icon: ChatCircleText },
    { href: "/challenges", label: "Check in challenge", icon: Trophy },
  ];

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getDailySummary(todayISO()),
      listMeals(todayISO()),
      getProfile().catch(() => null),
      getMealRecommendations({ limit: 1 }).catch(() => ({ remaining: { calories: null, protein: null, carbs: null, fat: null }, recommendations: [] })),
      listMyChallenge("ACTIVE").catch(() => []),
      getStreak().catch(() => null),
    ])
      .then(([daily, apiMeals, apiProfile, apiRecs, apiChallenges, apiStreak]) => {
        if (cancelled) return;
        setTotals({
          calories: Math.round(daily.totalCalories),
          protein: Math.round(daily.totalProtein),
          carbs: Math.round(daily.totalCarbs),
          fat: Math.round(daily.totalFat),
        });
        setMeals(apiMeals.map(mealFromApi));
        if (apiProfile) {
          setTargets({
            calories: apiProfile.dailyCalorieTarget ?? profile.targets.calories,
            protein: apiProfile.proteinTargetG ?? profile.targets.protein,
            carbs: apiProfile.carbsTargetG ?? profile.targets.carbs,
            fat: apiProfile.fatTargetG ?? profile.targets.fat,
          });
        }
        setLiveRec(apiRecs.recommendations[0] ?? null);
        setActiveChallenge(apiChallenges[0] ?? null);
        if (apiStreak) setStreak(apiStreak.currentStreak);
        setSource("live");
      })
      .catch(() => setSource("fallback"));
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = useMemo(() => ({
    calories: Math.max(0, targets.calories - totals.calories),
    protein: Math.max(0, targets.protein - totals.protein),
    carbs: Math.max(0, targets.carbs - totals.carbs),
    fat: Math.max(0, targets.fat - totals.fat),
  }), [targets, totals]);

  const fallbackRec = recommendations[0];
  const recommendationTitle = liveRec?.items.map((item) => item.name).join(", ") ?? fallbackRec.title;
  const recommendationReason = liveRec ? `Score ${Math.round(liveRec.score * 100)}. ${liveRec.reasons.join(", ")}.` : `Score ${Math.round(fallbackRec.score * 100)}. ${fallbackRec.reasons.join(", ")}.`;
  const challengeTitle = activeChallenge?.title ?? challenge.title;
  const challengeDays = activeChallenge?.daysCheckedIn ?? challenge.daysCheckedIn;
  const challengeDuration = activeChallenge?.durationDays ?? challenge.durationDays;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Today" title="Nutrition budget and next decision" action={{ label: "Log meal", href: "/snap" }} />

      <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Calories left" value={`${remaining.calories}`} sub={`${totals.calories}/${targets.calories} eaten`} />
        <Stat label="Protein gap" value={`${remaining.protein}g`} sub={`${totals.protein}/${targets.protein}g eaten`} />
        <Stat label="Logging streak" value={`${streak}d`} sub={source === "live" ? "Live backend data" : "Demo fallback"} />
        <Stat label="Active challenge" value={`${challengeDays}/${challengeDuration}`} sub={challengeTitle} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Panel className="overflow-hidden">
            <div className="grid lg:grid-cols-[340px_1fr]">
              <div className="bg-[#173c2b] p-5 text-white">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#d7ff68]">Next best action</p>
                <h2 className="mt-3 text-[28px] font-semibold leading-tight">{recommendationTitle}</h2>
                <p className="mt-3 text-[14px] leading-6 text-white/72">{recommendationReason}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/recommendations" className="rounded-md bg-[#d7ff68] px-4 py-2 text-[13px] font-bold text-[#101510]">Review options</Link>
                  <Link href="/coach" className="rounded-md border border-white/20 px-4 py-2 text-[13px] font-bold">Ask Ria</Link>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-[22px] font-semibold">Remaining budget</h2>
                  <span className="rounded-full bg-[#eef5f2] px-3 py-1 text-[12px] font-bold text-[#173c2b]">{source}</span>
                </div>
                <div className="space-y-4">
                  <BudgetBar label="Calories" value={totals.calories} target={targets.calories} unit="" />
                  <BudgetBar label="Protein" value={totals.protein} target={targets.protein} unit="g" tone="teal" />
                  <BudgetBar label="Carbs" value={totals.carbs} target={targets.carbs} unit="g" tone="sage" />
                  <BudgetBar label="Fat" value={totals.fat} target={targets.fat} unit="g" tone="amber" />
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[22px] font-semibold">Meal timeline</h2>
              <Link href="/meals" className="text-[13px] font-bold text-[#0f8b8d]">Open diary</Link>
            </div>
            <div className="space-y-3">
              {meals.map((meal) => <MealLine key={meal.id} meal={meal} />)}
              <div className="rounded-lg border border-dashed border-black/14 bg-[#f8f8f3] p-4">
                <p className="text-[14px] font-semibold">Dinner not logged</p>
                <p className="mt-1 text-[12px] text-[#5f675f]">Use the recommendation above or scan a meal.</p>
              </div>
            </div>
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel className="p-5">
            <h2 className="mb-4 text-[22px] font-semibold">Quick actions</h2>
            <div className="grid gap-2">
              {actions.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-md border border-black/8 bg-[#f8f8f3] p-3 text-[13px] font-semibold">
                  <Icon size={17} weight="duotone" className="text-[#173c2b]" />
                  {label}
                </Link>
              ))}
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0f8b8d]">Challenge</p>
                <h2 className="mt-1 text-[22px] font-semibold">{challengeTitle}</h2>
              </div>
              <Clock size={24} weight="duotone" className="text-[#173c2b]" />
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1.5">
              {Array.from({ length: challengeDuration }, (_, index) => (
                <div key={index} className={`h-9 rounded-md ${index < challengeDays ? "bg-[#173c2b]" : "bg-[#eef5f2]"}`} />
              ))}
            </div>
            <Link href="/challenges" className="mt-5 block rounded-md bg-[#d7ff68] py-2.5 text-center text-[13px] font-bold text-[#101510]">
              Check in
            </Link>
          </Panel>
        </aside>
      </section>
    </div>
  );
}
