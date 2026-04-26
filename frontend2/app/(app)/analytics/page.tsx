"use client";

import { useEffect, useMemo, useState } from "react";
import { getDailyAnalytics, getMacrosSummary, getStreak } from "@/lib/api/analytics";
import { getFamilyDailyAnalytics, getFamilyMacrosSummary, getFamilyOverview, getFamilyStreak } from "@/lib/api/family";
import { getProfile } from "@/lib/api/profile";
import type { FamilyMemberDTO } from "@/lib/api/types";
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
  const [days, setDays] = useState<DayRow[]>([]);
  const [targets, setTargets] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [streak, setStreak] = useState(0);
  const [macroShare, setMacroShare] = useState({ protein: 0, carbs: 0, fat: 0 });
  const [source, setSource] = useState<"loading" | "live" | "error">("loading");
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("me");
  const selectedMember = useMemo(
    () => familyMembers.find((member) => member.id === selectedMemberId) ?? null,
    [familyMembers, selectedMemberId],
  );
  const viewerLabel = selectedMember ? selectedMember.user.name || selectedMember.user.email : "Me";

  useEffect(() => {
    let cancelled = false;
    getFamilyOverview()
      .then((overview) => {
        if (cancelled) return;
        const members = overview.families.flatMap((family) => family.members).filter((member) => member.analyticsAccess);
        const unique = Array.from(new Map(members.map((member) => [member.id, member])).values());
        setFamilyMembers(unique);
      })
      .catch(() => {
        if (!cancelled) setFamilyMembers([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 6);
    const range = { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
    const dailyRequest = selectedMember ? getFamilyDailyAnalytics(selectedMember.id, range) : getDailyAnalytics(range);
    const macrosRequest = selectedMember ? getFamilyMacrosSummary(selectedMember.id, range).catch(() => null) : getMacrosSummary(range).catch(() => null);
    const streakRequest = selectedMember ? getFamilyStreak(selectedMember.id).catch(() => null) : getStreak().catch(() => null);
    const profileRequest = selectedMember ? Promise.resolve(null) : getProfile().catch(() => null);

    Promise.all([dailyRequest, macrosRequest, streakRequest, profileRequest])
      .then(([daily, macros, apiStreak, apiProfile]) => {
        if (cancelled) return;
        const liveTargets = {
          calories: daily.targets.calories ?? apiProfile?.dailyCalorieTarget ?? 0,
          protein: daily.targets.protein ?? apiProfile?.proteinTargetG ?? 0,
          carbs: daily.targets.carbs ?? apiProfile?.carbsTargetG ?? 0,
          fat: daily.targets.fat ?? apiProfile?.fatTargetG ?? 0,
        };
        setTargets(liveTargets);
        setDays(daily.days.map((day) => ({
          date: new Date(day.date).toLocaleDateString([], { weekday: "short" }),
          calories: Math.round(day.calories),
          protein: Math.round(day.protein),
          carbs: Math.round(day.carbs),
          fat: Math.round(day.fat),
          mealCount: day.mealCount,
          calorieTargetPct: liveTargets.calories ? (day.calories / liveTargets.calories) * 100 : 0,
        })));
        if (macros) {
          setMacroShare({
            protein: Math.round(macros.energyShare.protein),
            carbs: Math.round(macros.energyShare.carbs),
            fat: Math.round(macros.energyShare.fat),
          });
        }
        if (apiStreak) setStreak(apiStreak.loggingStreak);
        setSource("live");
      })
      .catch(() => setSource("error"));
    return () => {
      cancelled = true;
    };
  }, [selectedMember]);

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
  const calorieAdherence = targets.calories > 0 ? Math.round((averages.calories / targets.calories) * 100) : 0;
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
      {source === "error" ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[#b7791f]">Could not load analytics. Sign in and try again.</p>
        </Panel>
      ) : null}

      <section className="mb-5 flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-[0_10px_30px_rgba(16,21,16,0.05)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[12px] font-semibold text-[#5f675f]">Viewing</p>
          <p className="mt-1 text-[20px] font-semibold">{viewerLabel}</p>
        </div>
        <select
          value={selectedMemberId}
          onChange={(event) => setSelectedMemberId(event.target.value)}
          className="rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-semibold outline-none"
        >
          <option value="me">Me</option>
          {familyMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.user.name || member.user.email} · {member.role.toLowerCase()}
            </option>
          ))}
        </select>
      </section>

      <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Average calories" value={`${Math.round(averages.calories)}`} sub={`${calorieAdherence}% of target`} />
        <Stat label="Average protein" value={`${Math.round(averages.protein)}g`} sub={`${Math.max(0, targets.protein - Math.round(averages.protein))}g daily gap`} />
        <Stat label="Logging streak" value={`${streak}d`} sub={source === "live" ? "Current profile data" : "Waiting for profile data"} />
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
            {!days.length ? <p className="self-center text-[13px] font-semibold text-[#5f675f]">No analytics data in this range.</p> : null}
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
