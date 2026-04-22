"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "../../_components/AppState";
import { getDailySummary } from "@/lib/api/meals";
import { getProfile } from "@/lib/api/profile";
import type { DailySummary, UserProfile } from "@/lib/api/types";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const DEFAULT_TARGETS = {
  calories: 2150,
  protein: 128,
  carbs: 200,
  fat: 60,
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function CalorieRing({ eaten, target }: { eaten: number; target: number }) {
  const pct = target > 0 ? Math.min(eaten / target, 1) : 0;
  return (
    <div className="relative shrink-0">
      <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90" aria-hidden>
        <circle cx="74" cy="74" r="54" fill="none" stroke="rgba(31,59,45,0.07)" strokeWidth="13" />
        <motion.circle
          cx="74" cy="74" r="54"
          fill="none"
          stroke="#5E8A69"
          strokeWidth="13"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.25 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display text-[28px] font-bold leading-none text-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          {Math.round(eaten).toLocaleString()}
        </motion.span>
        <span className="mt-1 text-[11px] text-ink-muted">
          of {Math.round(target).toLocaleString()} kcal
        </span>
      </div>
    </div>
  );
}

interface MacroBarProps {
  label: string;
  eaten: number;
  target: number;
  color: string;
  delay: number;
}

function MacroBar({ label, eaten, target, color, delay }: MacroBarProps) {
  const pct = target > 0 ? Math.min(eaten / target, 1) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-ink-muted">{label}</span>
        <span className="font-medium text-ink">
          {Math.round(eaten)}g{" "}
          <span className="font-normal text-ink-muted">/ {Math.round(target)}g</span>
        </span>
      </div>
      <div className="h-[5px] w-full overflow-hidden rounded-full bg-ink/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, transformOrigin: "left" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct }}
          transition={{ duration: 1.1, ease: EASE, delay }}
        />
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-8 shadow-[0_10px_40px_rgba(31,59,45,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
      <div className="mb-7 h-4 w-32 animate-pulse rounded-full bg-ink/[0.06]" />
      <div className="flex items-center gap-10">
        <div className="h-[148px] w-[148px] animate-pulse rounded-full bg-ink/[0.06]" />
        <div className="flex flex-1 flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-24 animate-pulse rounded-full bg-ink/[0.06]" />
              <div className="h-[5px] w-full animate-pulse rounded-full bg-ink/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TodayCard() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p] = await Promise.all([
        getDailySummary(todayISO()),
        getProfile().catch(() => null),
      ]);
      setSummary(s);
      setProfile(p);
    } catch {
      setError("Couldn't load today's intake.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !summary) return <Skeleton />;

  if (error && !summary) {
    return (
      <ErrorState
        title="Couldn't load today's intake"
        message={error}
        onRetry={load}
        className="min-h-[250px]"
      />
    );
  }

  const eatenCals = summary?.totalCalories ?? 0;
  const targetCals = profile?.dailyCalorieTarget ?? DEFAULT_TARGETS.calories;
  const pct = targetCals > 0 ? Math.round((eatenCals / targetCals) * 100) : 0;

  const macros = [
    {
      label: "Protein",
      eaten: summary?.totalProtein ?? 0,
      target: profile?.proteinTargetG ?? DEFAULT_TARGETS.protein,
      color: "#5E8A69",
      delay: 0.5,
    },
    {
      label: "Carbs",
      eaten: summary?.totalCarbs ?? 0,
      target: profile?.carbsTargetG ?? DEFAULT_TARGETS.carbs,
      color: "#1F3B2D",
      delay: 0.65,
    },
    {
      label: "Fat",
      eaten: summary?.totalFat ?? 0,
      target: profile?.fatTargetG ?? DEFAULT_TARGETS.fat,
      color: "#7FA687",
      delay: 0.8,
    },
  ];

  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-8 shadow-[0_10px_40px_rgba(31,59,45,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-600">
            Today&apos;s intake
          </p>
          <h2 className="mt-1 font-display text-[22px] font-bold leading-none text-ink">
            Calories
          </h2>
        </div>
        <span className="rounded-full bg-sage/[0.12] px-3 py-1 text-[12px] font-semibold text-sage-600">
          {pct}% of goal
        </span>
      </div>

      <div className="flex items-center gap-10">
        <CalorieRing eaten={eatenCals} target={targetCals} />
        <div className="flex flex-1 flex-col gap-4">
          {macros.map((m) => (
            <MacroBar key={m.label} {...m} />
          ))}
        </div>
      </div>
    </div>
  );
}
