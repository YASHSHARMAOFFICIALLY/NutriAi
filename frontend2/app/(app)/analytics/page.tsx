"use client";

import { useEffect, useMemo, useState } from "react";
import { getDailyAnalytics, getMacrosSummary, getStreak } from "@/lib/api/analytics";
import { getProfile } from "@/lib/api/profile";
import { analytics, profile } from "../_components/mock-data";
import { PageHeader, Panel, Stat } from "../_components/ui";

type DayRow = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  calorieTargetPct?: number;
};

export default function AnalyticsPage() {
  const [days, setDays] = useState<DayRow[]>(analytics.days.map((day) => ({ ...day, carbs: 0, fat: 0 })));
  const [targets, setTargets] = useState(analytics.targets);
  const [streak, setStreak] = useState(analytics.streak.loggingStreak);
  const [macroShare, setMacroShare] = useState(analytics.macroShare);
  const [source, setSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    let cancelled = false;
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 6);
    const range = { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };

    Promise.all([
      getDailyAnalytics(range),
      getMacrosSummary(range).catch(() => null),
      getStreak().catch(() => null),
      getProfile().catch(() => null),
    ])
      .then(([apiDays, macros, apiStreak, apiProfile]) => {
        if (cancelled) return;
        const liveTargets = {
          calories: apiProfile?.dailyCalorieTarget ?? profile.targets.calories,
          protein: apiProfile?.proteinTargetG ?? profile.targets.protein,
          carbs: apiProfile?.carbsTargetG ?? profile.targets.carbs,
          fat: apiProfile?.fatTargetG ?? profile.targets.fat,
        };
        setTargets(liveTargets);
        setDays(apiDays.map((day) => ({
          date: new Date(day.date).toLocaleDateString([], { weekday: "short" }),
          calories: Math.round(day.calories),
          protein: Math.round(day.protein),
          carbs: Math.round(day.carbs),
          fat: Math.round(day.fat),
          mealCount: day.mealCount,
          calorieTargetPct: liveTargets.calories ? (day.calories / liveTargets.calories) * 100 : 0,
        })));
        if (macros) {
          const calories = Math.max(1, macros.calories);
          setMacroShare({
            protein: Math.round(((macros.protein * 4) / calories) * 100),
            carbs: Math.round(((macros.carbs * 4) / calories) * 100),
            fat: Math.round(((macros.fat * 9) / calories) * 100),
          });
        }
        if (apiStreak) setStreak(apiStreak.currentStreak);
        setSource("live");
      })
      .catch(() => setSource("fallback"));
    return () => {
      cancelled = true;
    };
  }, []);

  const averages = useMemo(() => {
    const count = Math.max(1, days.length);
    return days.reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories / count,
        protein: acc.protein + day.protein / count,
      }),
      { calories: 0, protein: 0 },
    );
  }, [days]);

  const max = Math.max(1, ...days.map((day) => day.calories));
  const calorieAdherence = Math.round((averages.calories / targets.calories) * 100);
  const proteinGap = Math.max(0, targets.protein - Math.round(averages.protein));
  const loggedDays = days.filter((day) => day.mealCount > 0).length;
  const macroDrift = Math.abs(macroShare.protein - 25) + Math.abs(macroShare.carbs - 45) + Math.abs(macroShare.fat - 30);
  const insights = [
    {
      title: "Protein consistency",
      value: proteinGap > 0 ? `${proteinGap}g short` : "On target",
      body: proteinGap > 0 ? "Recommendation and coach should bias dinner toward lean protein until the gap closes." : "Protein is supporting the current goal.",
    },
    {
      title: "Calorie adherence",
      value: `${calorieAdherence}%`,
      body: calorieAdherence > 110 ? "Average intake is running above target; review dinner portions." : calorieAdherence < 80 ? "Average intake is under target; add a predictable meal or snack." : "Calories are staying inside a useful range.",
    },
    {
      title: "Logging reliability",
      value: `${loggedDays}/7 days`,
      body: loggedDays < 5 ? "The weak point is logging frequency, not the nutrition math." : "Enough entries exist for better recommendations.",
    },
    {
      title: "Macro drift",
      value: macroDrift > 20 ? "High" : "Controlled",
      body: macroDrift > 20 ? "Macro split is drifting from the target pattern; inspect repeat meals." : "Macro distribution is close enough for useful weekly guidance.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Analytics" title="Adherence and streaks" />

      <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Average calories" value={`${Math.round(averages.calories)}`} sub={`${Math.round((averages.calories / targets.calories) * 100)}% of target`} />
        <Stat label="Average protein" value={`${Math.round(averages.protein)}g`} sub={`${Math.max(0, targets.protein - Math.round(averages.protein))}g daily gap`} />
        <Stat label="Logging streak" value={`${streak}d`} sub={source === "live" ? "Live backend data" : "Demo fallback"} />
        <Stat label="Macro share" value={`${macroShare.protein}%`} sub="Protein energy share" />
      </section>

      <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {insights.map((item) => (
          <Panel key={item.title} className="p-4">
            <p className="text-[12px] font-semibold text-[#5f675f]">{item.title}</p>
            <p className="mt-2 text-[24px] font-semibold">{item.value}</p>
            <p className="mt-2 text-[12px] leading-5 text-[#5f675f]">{item.body}</p>
          </Panel>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[22px] font-semibold">Daily target adherence</h2>
            <span className="text-[12px] font-bold text-[#5f675f]">7 day range · {source}</span>
          </div>
          <div className="flex h-[320px] items-end gap-3 rounded-lg bg-[#f8f8f3] p-4">
            {days.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-col justify-end rounded-md bg-white" style={{ height: "260px" }}>
                  <div
                    className={`rounded-md ${day.calorieTargetPct && day.calorieTargetPct > 120 ? "bg-[#b7791f]" : day.calorieTargetPct && day.calorieTargetPct >= 80 ? "bg-[#173c2b]" : "bg-[#5f8f72]"}`}
                    style={{ height: `${Math.max(8, (day.calories / max) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-[#5f675f]">{day.date}</span>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="p-5">
            <h2 className="mb-4 text-[22px] font-semibold">Macro energy share</h2>
            <div className="space-y-3">
              {[
                ["Protein", macroShare.protein, "#0f8b8d"],
                ["Carbs", macroShare.carbs, "#5f8f72"],
                ["Fat", macroShare.fat, "#b7791f"],
              ].map(([label, value, color]) => (
                <div key={String(label)}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="font-semibold">{label}</span>
                    <span className="text-[#5f675f]">{value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/8">
                    <div className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: String(color) }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="mb-3 text-[22px] font-semibold">Pattern this week</h2>
            <p className="text-[14px] leading-6 text-[#5f675f]">
              {proteinGap > 0
                ? "Protein is the limiting metric. Calories are controlled on most days, but dinner often decides whether the target is reached."
                : "The week has enough protein signal. The next improvement is keeping logging complete enough for recommendations to stay accurate."}
            </p>
          </Panel>
        </div>
      </section>
    </div>
  );
}
