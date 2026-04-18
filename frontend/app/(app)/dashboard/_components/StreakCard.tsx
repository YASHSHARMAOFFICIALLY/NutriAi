"use client";

import { useEffect, useState } from "react";
import { Flame } from "@phosphor-icons/react/dist/ssr";
import { getDailyAnalytics, getStreak } from "@/lib/api/analytics";
import type { DailyAnalytics, StreakInfo } from "@/lib/api/types";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function past7Dates(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(isoDate(d));
  }
  return out;
}

function Skeleton() {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm">
      <div className="h-3 w-16 animate-pulse rounded-full bg-ink/[0.06]" />
      <div className="mt-4 h-10 w-24 animate-pulse rounded-lg bg-ink/[0.06]" />
      <div className="mt-5 flex gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-2 flex-1 animate-pulse rounded-full bg-ink/[0.06]" />
        ))}
      </div>
    </div>
  );
}

export function StreakCard() {
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [week, setWeek] = useState<DailyAnalytics[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const dates = past7Dates();
    const from = dates[0];
    const to = dates[dates.length - 1];
    Promise.all([
      getStreak(),
      getDailyAnalytics({ from, to }).catch(() => [] as DailyAnalytics[]),
    ])
      .then(([s, w]) => {
        setStreak(s);
        setWeek(w);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (failed || !streak) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm">
        <div className="mb-1 flex items-center gap-2">
          <Flame size={14} weight="fill" className="text-orange-400" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">Streak</p>
        </div>
        <p className="mt-3 text-[13px] text-ink-muted">Couldn&apos;t load streak.</p>
      </div>
    );
  }

  const dates = past7Dates();
  const today = dates[dates.length - 1];
  const loggedByDate = new Map<string, boolean>();
  for (const d of week ?? []) {
    loggedByDate.set(d.date.slice(0, 10), d.mealCount > 0);
  }

  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_10px_40px_rgba(31,59,45,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2">
        <Flame size={14} weight="fill" className="text-orange-400" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
          Streak
        </p>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-5xl font-bold leading-none text-ink">
          {streak.currentStreak}
        </span>
        <span className="text-[14px] text-ink-muted">
          {streak.currentStreak === 1 ? "day" : "days"} in a row
        </span>
      </div>

      <div className="mt-5 flex gap-1.5">
        {dates.map((date, i) => {
          const logged = loggedByDate.get(date) ?? false;
          const isToday = date === today;
          return (
            <div
              key={date}
              title={isToday ? "Today" : date}
              className={[
                "h-2 flex-1 rounded-full",
                isToday && logged ? "bg-forest" : logged ? "bg-sage" : "bg-ink/[0.08]",
              ].join(" ")}
            />
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-ink-muted/60">Past 7 days</p>
    </div>
  );
}
