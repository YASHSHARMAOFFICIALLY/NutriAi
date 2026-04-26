"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, ForkKnife, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { updateProfile } from "@/lib/api/profile";

type Form = {
  sex: string;
  birthYear: string;
  heightCm: string;
  weightKg: string;
  activityLevel: string;
  goal: string;
  dietaryPrefs: string;
  allergies: string;
  dailyBudgetUsd: string;
  timezone: string;
};

const initialForm: Form = {
  sex: "MALE",
  birthYear: "1998",
  heightCm: "178",
  weightKg: "72.4",
  activityLevel: "MODERATE",
  goal: "GAIN",
  dietaryPrefs: "high protein, Indian food",
  allergies: "peanuts",
  dailyBudgetUsd: "12",
  timezone: "Asia/Kolkata",
};

function numberOrNull(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function listFromCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const targets = useMemo(() => {
    const weight = numberOrNull(form.weightKg) ?? 72.4;
    const height = numberOrNull(form.heightCm) ?? 178;
    const birthYear = numberOrNull(form.birthYear) ?? 1998;
    const age = new Date().getFullYear() - birthYear;
    const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (form.sex === "FEMALE" ? -161 : 5));
    const multiplier = form.activityLevel === "ACTIVE" ? 1.725 : form.activityLevel === "MODERATE" ? 1.55 : form.activityLevel === "LIGHT" ? 1.375 : 1.2;
    const tdee = Math.round(bmr * multiplier);
    const calories = form.goal === "LOSE" ? tdee - 350 : form.goal === "GAIN" ? tdee + 250 : tdee;
    return {
      bmr,
      tdee,
      calories,
      protein: Math.round(weight * 2),
      carbs: Math.round((calories * 0.42) / 4),
      fat: Math.round((calories * 0.28) / 9),
    };
  }, [form]);

  function updateField(key: keyof Form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setStatus("saving");
    try {
      await updateProfile({
        sex: form.sex === "MALE" || form.sex === "FEMALE" || form.sex === "OTHER" ? form.sex : null,
        birthYear: numberOrNull(form.birthYear),
        heightCm: numberOrNull(form.heightCm),
        weightKg: numberOrNull(form.weightKg),
        activityLevel: form.activityLevel === "SEDENTARY" || form.activityLevel === "LIGHT" || form.activityLevel === "MODERATE" || form.activityLevel === "ACTIVE" || form.activityLevel === "VERY_ACTIVE" ? form.activityLevel : null,
        goal: form.goal === "LOSE" || form.goal === "MAINTAIN" || form.goal === "GAIN" ? form.goal : null,
        dailyBudgetUsd: numberOrNull(form.dailyBudgetUsd),
        timezone: form.timezone,
        dietaryPrefs: listFromCsv(form.dietaryPrefs),
        allergies: listFromCsv(form.allergies),
        dailyCalorieTarget: targets.calories,
        proteinTargetG: targets.protein,
        carbsTargetG: targets.carbs,
        fatTargetG: targets.fat,
        notifyStreakRisk: true,
        notifyWeeklyDigest: true,
      });
      router.push("/dashboard");
    } catch {
      setStatus("error");
    }
  }

  const profileFields: Array<[keyof Form, string]> = [
    ["sex", "Sex"],
    ["birthYear", "Birth year"],
    ["heightCm", "Height"],
    ["weightKg", "Weight"],
    ["activityLevel", "Activity"],
    ["goal", "Goal"],
  ];

  return (
    <main className="min-h-screen bg-[#f8f8f3] px-5 py-8 text-[#101510]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#173c2b] text-white">
              <ForkKnife size={18} weight="bold" />
            </span>
            NutriAI
          </Link>
          <Link href="/dashboard" className="text-[13px] font-bold text-[#5f675f]">Skip for now</Link>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-xl bg-[#173c2b] p-7 text-white">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#d7ff68]">Profile calibration</p>
            <h1 className="mt-4 text-[56px] font-semibold leading-[0.94]">Targets should come from real inputs.</h1>
            <p className="mt-5 text-[15px] leading-7 text-white/72">
              This setup uses your body data, goal, activity, preferences, allergies, budget, timezone, and notification choices to personalize your plan.
            </p>
            <div className="mt-8 rounded-lg border border-white/14 bg-white/10 p-5">
              <div className="mb-4 flex items-center gap-3">
                <Calculator size={24} weight="duotone" className="text-[#d7ff68]" />
                <p className="font-semibold">Derived target preview</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["BMR", targets.bmr],
                  ["TDEE", targets.tdee],
                  ["Calories", targets.calories],
                  ["Protein", `${targets.protein}g`],
                  ["Carbs", `${targets.carbs}g`],
                  ["Fat", `${targets.fat}g`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md bg-white/10 p-3">
                    <p className="text-[20px] font-semibold">{value}</p>
                    <p className="text-[11px] text-white/58">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <section className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_16px_48px_rgba(16,21,16,0.07)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Step 1</p>
                  <h2 className="mt-1 text-[28px] font-semibold">Body and goal</h2>
                </div>
                <span className="rounded-full bg-[#eef5f2] px-3 py-1 text-[12px] font-bold text-[#173c2b]">required</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {profileFields.map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="text-[12px] font-semibold text-[#5f675f]">{label}</span>
                    <input className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-bold outline-none" value={form[key]} onChange={(event) => updateField(key, event.target.value)} />
                  </label>
                ))}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_16px_48px_rgba(16,21,16,0.07)]">
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Step 2</p>
                <h2 className="mt-1 text-[26px] font-semibold">Food rules</h2>
                <div className="mt-5 space-y-3">
                  {[
                    ["dietaryPrefs", "Dietary preferences"],
                    ["allergies", "Allergies"],
                    ["dailyBudgetUsd", "Daily budget"],
                    ["timezone", "Timezone"],
                  ].map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="text-[12px] font-semibold text-[#5f675f]">{label}</span>
                      <input className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-bold outline-none" value={form[key as keyof Form]} onChange={(event) => updateField(key as keyof Form, event.target.value)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_16px_48px_rgba(16,21,16,0.07)]">
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Step 3</p>
                <h2 className="mt-1 text-[26px] font-semibold">Notification posture</h2>
                <div className="mt-5 space-y-3">
                  {["Streak risk email after 7 PM", "Weekly digest every Sunday", "Coach can use meal context"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-md bg-[#f8f8f3] p-3">
                      <ShieldCheck size={18} weight="duotone" className="text-[#173c2b]" />
                      <p className="text-[13px] font-semibold">{item}</p>
                    </div>
                  ))}
                </div>
                {status === "error" ? <p className="mt-4 text-[12px] font-semibold text-[#b7791f]">Could not save profile. Sign in and try again.</p> : null}
                <button onClick={handleSave} disabled={status === "saving"} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#173c2b] py-3 text-[14px] font-bold text-white disabled:opacity-60">
                  {status === "saving" ? "Saving..." : "Save profile"}
                  <ArrowRight size={15} weight="bold" />
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
