"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, ForkKnife, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { updateProfile } from "@/lib/api/profile";
import { sexLabels, activityLabels, goalLabels } from "@/lib/enumLabels";

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
  sex: "",
  birthYear: "",
  heightCm: "",
  weightKg: "",
  activityLevel: "",
  goal: "MAINTAIN",
  dietaryPrefs: "",
  allergies: "",
  dailyBudgetUsd: "",
  timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "",
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
    const weight = numberOrNull(form.weightKg);
    const height = numberOrNull(form.heightCm);
    const birthYear = numberOrNull(form.birthYear);
    if (!weight || !height || !birthYear || !form.sex || !form.activityLevel) {
      return { bmr: 0, tdee: 0, calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
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

  const requiredFields: Array<keyof Form> = ["sex", "birthYear", "heightCm", "weightKg", "activityLevel", "goal"];
  const completedRequired = requiredFields.filter((key) => String(form[key]).trim()).length;
  const requiredComplete = completedRequired === requiredFields.length && targets.calories > 0;
  const setupPercent = Math.round((completedRequired / requiredFields.length) * 100);

  function updateField(key: keyof Form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(next = "/dashboard") {
    if (!requiredComplete) {
      setStatus("error");
      return;
    }
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
      router.push(next);
    } catch {
      setStatus("error");
    }
  }

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
              This setup uses your own body data, goal, activity, preferences, allergies, budget, timezone, and notification choices to personalize your plan.
            </p>
            <div className="mt-6 rounded-lg border border-white/14 bg-white/10 p-4">
              <div className="mb-2 flex items-center justify-between text-[12px] font-bold">
                <span className="text-white/72">Setup completion</span>
                <span className="text-[#d7ff68]">{setupPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/12">
                <div className="h-full rounded-full bg-[#d7ff68] transition-all" style={{ width: `${setupPercent}%` }} />
              </div>
            </div>
            <div className="mt-6 grid gap-2">
              {["Body and goal", "Food rules", "Notifications", "First meal"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-md bg-white/10 px-3 py-2">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-[#d7ff68] text-[12px] font-bold text-[#173c2b]">{index + 1}</span>
                  <span className="text-[13px] font-semibold text-white/82">{step}</span>
                </div>
              ))}
            </div>
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
                    <p className="text-[20px] font-semibold">{value || "-"}</p>
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
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Sex</span>
                  <select className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-bold outline-none" value={form.sex} onChange={(e) => updateField("sex", e.target.value)}>
                    <option value="">Select sex</option>
                    {Object.entries(sexLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Birth year</span>
                  <input type="number" className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-bold outline-none" value={form.birthYear} onChange={(e) => updateField("birthYear", e.target.value)} placeholder="1998" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Height (cm)</span>
                  <input type="number" className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-bold outline-none" value={form.heightCm} onChange={(e) => updateField("heightCm", e.target.value)} placeholder="178" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Weight (kg)</span>
                  <input type="number" step="0.1" className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-bold outline-none" value={form.weightKg} onChange={(e) => updateField("weightKg", e.target.value)} placeholder="72.4" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Activity level</span>
                  <select className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-bold outline-none" value={form.activityLevel} onChange={(e) => updateField("activityLevel", e.target.value)}>
                    <option value="">Select activity</option>
                    {Object.entries(activityLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Goal</span>
                  <select className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-bold outline-none" value={form.goal} onChange={(e) => updateField("goal", e.target.value)}>
                    {Object.entries(goalLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </label>
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
                {status === "error" ? <p className="mt-4 text-[12px] font-semibold text-[#b7791f]">{requiredComplete ? "Could not save profile. Sign in and try again." : "Complete the required body and goal fields first."}</p> : null}
                <button onClick={() => handleSave("/dashboard")} disabled={status === "saving" || !requiredComplete} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#173c2b] py-3 text-[14px] font-bold text-white disabled:opacity-60">
                  {status === "saving" ? "Saving..." : "Save and open dashboard"}
                  <ArrowRight size={15} weight="bold" />
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_16px_48px_rgba(16,21,16,0.07)]">
              <div className="grid gap-4 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Step 4</p>
                  <h2 className="mt-1 text-[26px] font-semibold">Start with one real meal</h2>
                  <p className="mt-2 text-[14px] leading-6 text-[#5f675f]">
                    Once the profile is saved, log a first meal so your dashboard, recommendations, and coach have real context.
                  </p>
                </div>
                <button onClick={() => handleSave("/snap")} disabled={status === "saving" || !requiredComplete} className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-[#f8f8f3] px-5 py-3 text-[14px] font-bold text-[#173c2b] disabled:opacity-50">
                  Save and log meal
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
