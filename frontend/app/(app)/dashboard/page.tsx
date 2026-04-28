"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import { Camera, ChatCircleText, Medal, Star } from "@phosphor-icons/react/dist/ssr";
import { getStreak } from "@/lib/api/analytics";
import { listMyChallenge } from "@/lib/api/challenges";
import { getDailySummary, listMeals } from "@/lib/api/meals";
import { getProfile } from "@/lib/api/profile";
import { getMealRecommendations } from "@/lib/api/recommendations";
import type { MealDTO, MealRecommendation, UserChallengeDTO } from "@/lib/api/types";
import { BudgetBar, MealLine, PageHeader, Panel, Stat } from "../_components/ui";
import type { Meal } from "../_components/ui";

function safeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

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

import { motion } from "framer-motion";

// ... existing helper functions (todayISO, mealFromApi) unchanged

import { StatSkeleton, Skeleton } from "../_components/ui";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [targets, setTargets] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [streak, setStreak] = useState(0);
  const [activeChallenge, setActiveChallenge] = useState<UserChallengeDTO | null>(null);
  const [liveRec, setLiveRec] = useState<MealRecommendation | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const actions: Array<{ href: string; label: string; icon: ElementType }> = [
    { href: "/snap", label: "Analyze food", icon: Camera },
    { href: "/recommendations", label: "Pick from history", icon: Star },
    { href: "/coach", label: "Ask Coach Ria", icon: ChatCircleText },
    { href: "/challenges", label: "Check in challenge", icon: Medal },
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
          calories: safeNumber(Math.round(daily.totalCalories)),
          protein: safeNumber(Math.round(daily.totalProtein)),
          carbs: safeNumber(Math.round(daily.totalCarbs)),
          fat: safeNumber(Math.round(daily.totalFat)),
        });
        setMeals(apiMeals.map(mealFromApi));
        if (apiProfile) {
          setTargets({
            calories: apiProfile.dailyCalorieTarget ?? 0,
            protein: apiProfile.proteinTargetG ?? 0,
            carbs: apiProfile.carbsTargetG ?? 0,
            fat: apiProfile.fatTargetG ?? 0,
          });
        }
        setLiveRec(apiRecs.recommendations[0] ?? null);
        setActiveChallenge(apiChallenges[0] ?? null);
        if (apiStreak) setStreak(apiStreak.loggingStreak);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = useMemo(() => ({
    calories: Math.max(0, safeNumber(targets.calories) - safeNumber(totals.calories)),
    protein: Math.max(0, safeNumber(targets.protein) - safeNumber(totals.protein)),
    carbs: Math.max(0, safeNumber(targets.carbs) - safeNumber(totals.carbs)),
    fat: Math.max(0, safeNumber(targets.fat) - safeNumber(totals.fat)),
  }), [targets, totals]);

  const hasTargets = safeNumber(targets.calories) > 0;
  const hasMeals = meals.length > 0;
  const greeting = useMemo(() => getGreeting(), []);
  const recommendationTitle =
    liveRec?.items.map((item) => item.name).join(", ") || (hasMeals ? "Build your next plate" : "Log your first meal");
  const recommendationReason = liveRec
    ? `Score ${Math.round(liveRec.score * 100)}. ${liveRec.reasons.join(", ")}.`
    : hasMeals
      ? "Save a few more meals to unlock ranked suggestions from your own history."
      : "Start with a quick scan or manual log, then this area will turn into a personalized next step.";
  const challengeTitle = activeChallenge?.title ?? "No active challenge";
  const challengeDays = activeChallenge?.daysCheckedIn ?? 0;
  const challengeDuration = activeChallenge?.durationDays ?? 0;
  const goalProgress =
    safeNumber(targets.calories) > 0
      ? Math.round((safeNumber(totals.calories) / safeNumber(targets.calories)) * 100)
      : 0;

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-12 w-64 md:w-96" />
        </div>
        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <PageHeader eyebrow="Dashboard" title="Sign in required" action={{ label: "Log in", href: "/login" }} />
        <Panel className="p-8">
          <p className="text-[15px] font-semibold text-forest">Could not load live dashboard data.</p>
          <p className="mt-2 text-[13px] text-muted">Sign in again to load your meals, targets, and recommendations.</p>
        </Panel>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-6 py-10 lg:px-10"
    >
      <PageHeader 
        eyebrow={`${greeting} · ${hasMeals ? "Today is in progress" : "Start today's log"}`}
        title="Today's nutrition"
        action={{ label: "Scan meal", href: "/snap" }}
      />

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Calories left", value: hasTargets ? `${remaining.calories}` : "Set target", sub: hasTargets ? `${totals.calories}/${targets.calories} kcal` : "Add targets in settings" },
          { label: "Protein gap", value: targets.protein > 0 ? `${remaining.protein}g` : "Set target", sub: targets.protein > 0 ? `${totals.protein}/${targets.protein}g logged` : "Add protein target" },
          { label: "Logging streak", value: `${streak}d`, sub: streak > 0 ? "Keep the chain going" : "Log today to start" },
          { label: "Goal progress", value: hasTargets ? `${goalProgress}%` : "Pending", sub: hasTargets ? "Daily target" : "Waiting for targets" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Stat {...stat} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Panel className="overflow-hidden border-none shadow-premium">
              <div className="grid lg:grid-cols-[380px_1fr]">
                <div className="relative overflow-hidden bg-forest p-8 text-white">
                  <div className="relative z-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lime">Next best decision</p>
                    <h2 className="mt-4 text-[32px] font-bold leading-tight tracking-tight">{recommendationTitle}</h2>
                    <p className="mt-4 text-[15px] leading-relaxed text-white/80">{recommendationReason}</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link href={liveRec ? "/recommendations" : "/snap"} className="rounded-xl bg-lime px-6 py-3 text-[14px] font-bold text-forest shadow-lg transition-transform hover:scale-105 active:scale-95">
                        {liveRec ? "Open suggestion" : "Scan meal"}
                      </Link>
                      <Link href={hasMeals ? "/coach" : "/meals"} className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-[14px] font-bold backdrop-blur-sm transition-colors hover:bg-white/10">
                        {hasMeals ? "Ask Ria" : "Open diary"}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="bg-surface p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-[24px] font-bold text-forest tracking-tight">Eaten vs Target</h2>
                  </div>
                  <div className="space-y-6">
                    <BudgetBar label="Total Calories" value={totals.calories} target={targets.calories} unit="kcal" />
                    <BudgetBar label="Protein" value={totals.protein} target={targets.protein} unit="g" tone="teal" />
                    <BudgetBar label="Carbohydrates" value={totals.carbs} target={targets.carbs} unit="g" tone="sage" />
                    <BudgetBar label="Healthy Fats" value={totals.fat} target={targets.fat} unit="g" tone="amber" />
                  </div>
                </div>
              </div>
            </Panel>
          </motion.div>

          <Panel className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[24px] font-bold text-forest tracking-tight">Recent Logs</h2>
              <Link href="/meals" className="text-[14px] font-bold text-teal hover:underline underline-offset-4 decoration-2">
                Open full diary
              </Link>
            </div>
            <div className="space-y-4">
              {meals.length > 0 ? (
                meals.map((meal, i) => (
                  <motion.div key={meal.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                    <MealLine meal={meal} />
                  </motion.div>
                ))
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border bg-surface-alt p-8 text-center">
                  <p className="text-[15px] font-bold text-forest">No meals logged today</p>
                  <p className="mt-2 text-[13px] text-muted">Use a photo scan or add a meal manually to fill this timeline.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Link href="/snap" className="rounded-xl bg-forest px-4 py-3 text-[13px] font-bold text-white">Scan meal</Link>
                    <Link href="/meals" className="rounded-xl border border-border bg-white px-4 py-3 text-[13px] font-bold text-forest">Open diary</Link>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>

        <aside className="space-y-8">
          <Panel className="p-6">
            <h2 className="mb-5 text-[20px] font-bold text-forest tracking-tight">Quick Actions</h2>
            <div className="grid gap-3">
              {actions.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="group flex items-center gap-4 rounded-xl border border-border bg-surface-alt p-4 transition-all hover:bg-white hover:shadow-md hover:border-teal/30">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-forest shadow-sm group-hover:bg-forest group-hover:text-white transition-colors">
                    <Icon size={20} weight="bold" />
                  </span>
                  <span className="text-[14px] font-bold text-forest">{label}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="bg-surface-alt p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal">Current Challenge</p>
                  <h2 className="mt-2 text-[20px] font-bold text-forest tracking-tight">{challengeTitle}</h2>
                </div>
                <div className="rounded-xl bg-forest p-2.5 text-white shadow-lg">
                  <Medal size={20} weight="fill" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between text-[13px] font-bold">
                <span className="text-muted">Consistency</span>
                <span className="text-forest">{challengeDays} / {challengeDuration} days</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {challengeDuration > 0 ? Array.from({ length: challengeDuration }, (_, index) => (
                  <div 
                    key={index} 
                    className={`h-10 rounded-lg transition-all ${
                      index < challengeDays 
                        ? "bg-forest shadow-sm" 
                        : "bg-surface-alt border border-border"
                    }`} 
                  />
                )) : <p className="col-span-7 text-[13px] font-semibold text-muted">Start a challenge to track progress.</p>}
              </div>
              <Link href="/challenges" className="mt-6 block rounded-xl bg-forest py-3.5 text-center text-[14px] font-bold text-white shadow-premium transition-transform hover:scale-[1.02] active:scale-[0.98]">
                {activeChallenge ? "Check in now" : "Start challenge"}
              </Link>
            </div>
          </Panel>
        </aside>
      </section>
    </motion.div>
  );
}
