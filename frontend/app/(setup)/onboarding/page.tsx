"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Calculator, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import { track } from "@hellyeah/x-ray";
import { MealCalcTable } from "./_components/MealCalcTable";
import { previewTargets, updateProfile } from "@/lib/api/profile";
import type { ActivityLevel, DerivedTargets, Goal, Sex } from "@/lib/api/types";
import { listFromCsv, numberOrNull } from "@/lib/form";
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
  notifyStreakRisk: boolean;
  notifyWeeklyDigest: boolean;
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
  notifyStreakRisk: true,
  notifyWeeklyDigest: true,
};

const emptyDerived: DerivedTargets = {
  bmr: null,
  tdee: null,
  dailyCalorieTarget: null,
  proteinTargetG: null,
  carbsTargetG: null,
  fatTargetG: null,
};

const requiredFields: Array<keyof Form> = ["sex", "birthYear", "heightCm", "weightKg", "activityLevel", "goal"];

const inputClass = "mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-bold outline-none transition-colors focus:border-[#0f8b8d]";

function asSex(value: string): Sex | null {
  return value === "MALE" || value === "FEMALE" || value === "OTHER" ? value : null;
}

function asActivity(value: string): ActivityLevel | null {
  return value === "SEDENTARY" || value === "LIGHT" || value === "MODERATE" || value === "ACTIVE" || value === "VERY_ACTIVE"
    ? value
    : null;
}

function asGoal(value: string): Goal | null {
  return value === "LOSE" || value === "MAINTAIN" || value === "GAIN" ? value : null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [derived, setDerived] = useState<DerivedTargets>(emptyDerived);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const completedRequired = requiredFields.filter((key) => String(form[key]).trim()).length;
  const requiredComplete = completedRequired === requiredFields.length;
  const setupPercent = Math.round((completedRequired / requiredFields.length) * 100);

  const targetCalories = derived.dailyCalorieTarget ?? 0;
  const targetProtein = derived.proteinTargetG ?? 0;
  const hasDerived = derived.dailyCalorieTarget !== null;

  // Targets come from the backend (single source of truth). Debounce the preview
  // so we don't fire on every keystroke while the user fills body details.
  const previewKey = `${form.sex}|${form.birthYear}|${form.heightCm}|${form.weightKg}|${form.activityLevel}|${form.goal}`;
  useEffect(() => {
    const input = {
      sex: asSex(form.sex),
      birthYear: numberOrNull(form.birthYear),
      heightCm: numberOrNull(form.heightCm),
      weightKg: numberOrNull(form.weightKg),
      activityLevel: asActivity(form.activityLevel),
      goal: asGoal(form.goal),
    };
    let active = true;
    const timer = setTimeout(() => {
      previewTargets(input)
        .then((next) => { if (active) setDerived(next); })
        .catch(() => { if (active) setDerived(emptyDerived); });
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // previewKey captures every field that affects the preview.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey]);

  function updateField<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(next: string) {
    if (!requiredComplete) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    try {
      await updateProfile({
        sex: asSex(form.sex),
        birthYear: numberOrNull(form.birthYear),
        heightCm: numberOrNull(form.heightCm),
        weightKg: numberOrNull(form.weightKg),
        activityLevel: asActivity(form.activityLevel),
        goal: asGoal(form.goal),
        dailyBudgetUsd: numberOrNull(form.dailyBudgetUsd),
        timezone: form.timezone || null,
        dietaryPrefs: listFromCsv(form.dietaryPrefs),
        allergies: listFromCsv(form.allergies),
        notifyStreakRisk: form.notifyStreakRisk,
        notifyWeeklyDigest: form.notifyWeeklyDigest,
      });
      track("onboarding_completed", { goal: form.goal || null });
      router.replace(next);
    } catch {
      setStatus("error");
    }
  }

  const derivedRows: Array<[string, string]> = [
    ["BMR", derived.bmr !== null ? String(derived.bmr) : "-"],
    ["TDEE", derived.tdee !== null ? String(derived.tdee) : "-"],
    ["Calories", derived.dailyCalorieTarget !== null ? String(derived.dailyCalorieTarget) : "-"],
    ["Protein", derived.proteinTargetG !== null ? `${derived.proteinTargetG}g` : "-"],
    ["Carbs", derived.carbsTargetG !== null ? `${derived.carbsTargetG}g` : "-"],
    ["Fat", derived.fatTargetG !== null ? `${derived.fatTargetG}g` : "-"],
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
          <Link href="/dashboard" className="text-[13px] font-bold text-[#5f675f] hover:text-[#173c2b]">Skip for now</Link>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="order-2 rounded-xl bg-[#173c2b] p-7 text-white xl:order-1">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#d7ff68]">Profile calibration</p>
            <h1 className="mt-4 text-3xl font-semibold leading-[0.98] sm:text-4xl lg:text-[56px] lg:leading-[0.94]">Targets should come from real inputs.</h1>
            <p className="mt-5 text-[15px] leading-7 text-white/72">
              This setup uses your own body data, goal, activity, preferences, allergies, budget, timezone, and notification choices to personalize your plan.
            </p>
            <div className="mt-6 rounded-lg border border-white/14 bg-white/10 p-4">
              <div className="mb-2 flex items-center justify-between text-[12px] font-bold">
                <span className="text-white/72">Setup completion</span>
                <span className="text-[#d7ff68]">{setupPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/12">
                <div className="h-full rounded-full bg-[#d7ff68] transition-[width] duration-300 ease-out motion-reduce:transition-none" style={{ width: `${setupPercent}%` }} />
              </div>
            </div>
            <div className="mt-8 rounded-lg border border-white/14 bg-white/10 p-5">
              <div className="mb-4 flex items-center gap-3">
                <Calculator size={24} weight="duotone" className="text-[#d7ff68]" />
                <p className="font-semibold">Derived target preview</p>
              </div>
              {hasDerived ? (
                <div className="grid grid-cols-2 gap-3">
                  {derivedRows.map(([label, value]) => (
                    <div key={label} className="rounded-md bg-white/10 p-3">
                      <p className="text-[20px] font-semibold tabular-nums">{value}</p>
                      <p className="text-[11px] text-white/58">{label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] leading-6 text-white/64">Fill in your body details to see your targets. They calculate automatically as you type.</p>
              )}
            </div>
          </div>

          <div className="order-1 space-y-5 xl:order-2">
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
                  <select className={inputClass} value={form.sex} onChange={(e) => updateField("sex", e.target.value)}>
                    <option value="">Select sex</option>
                    {Object.entries(sexLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Birth year</span>
                  <input type="number" inputMode="numeric" className={inputClass} value={form.birthYear} onChange={(e) => updateField("birthYear", e.target.value)} placeholder="1998" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Height (cm)</span>
                  <input type="number" inputMode="numeric" className={inputClass} value={form.heightCm} onChange={(e) => updateField("heightCm", e.target.value)} placeholder="178" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Weight (kg)</span>
                  <input type="number" inputMode="decimal" step="0.1" className={inputClass} value={form.weightKg} onChange={(e) => updateField("weightKg", e.target.value)} placeholder="72.4" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Activity level</span>
                  <select className={inputClass} value={form.activityLevel} onChange={(e) => updateField("activityLevel", e.target.value)}>
                    <option value="">Select activity</option>
                    {Object.entries(activityLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#5f675f]">Goal</span>
                  <select className={inputClass} value={form.goal} onChange={(e) => updateField("goal", e.target.value)}>
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
                  <label className="block">
                    <span className="text-[12px] font-semibold text-[#5f675f]">Dietary preferences</span>
                    <input className={inputClass} value={form.dietaryPrefs} onChange={(e) => updateField("dietaryPrefs", e.target.value)} placeholder="Vegetarian, high protein" />
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-semibold text-[#5f675f]">Allergies</span>
                    <input className={inputClass} value={form.allergies} onChange={(e) => updateField("allergies", e.target.value)} placeholder="Peanuts, shellfish" />
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-semibold text-[#5f675f]">Daily food budget (optional)</span>
                    <input type="number" inputMode="decimal" className={inputClass} value={form.dailyBudgetUsd} onChange={(e) => updateField("dailyBudgetUsd", e.target.value)} placeholder="Skip if you'd rather not set one" />
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-semibold text-[#5f675f]">Timezone</span>
                    <input className={inputClass} value={form.timezone} onChange={(e) => updateField("timezone", e.target.value)} placeholder="Asia/Kolkata" />
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_16px_48px_rgba(16,21,16,0.07)]">
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Step 3</p>
                <h2 className="mt-1 text-[26px] font-semibold">Notifications</h2>
                <p className="mt-2 text-[13px] leading-6 text-[#5f675f]">Optional reminders. Change these anytime in settings.</p>
                <div className="mt-5 space-y-3">
                  <Toggle
                    label="Streak risk email"
                    description="A nudge when your logging streak is about to break."
                    checked={form.notifyStreakRisk}
                    onChange={(v) => updateField("notifyStreakRisk", v)}
                  />
                  <Toggle
                    label="Weekly digest"
                    description="A Sunday summary of the week's nutrition."
                    checked={form.notifyWeeklyDigest}
                    onChange={(v) => updateField("notifyWeeklyDigest", v)}
                  />
                </div>
              </div>
            </section>

            {hasDerived && (
              <section className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_16px_48px_rgba(16,21,16,0.07)]">
                <div className="mb-5">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Step 4</p>
                  <h2 className="mt-1 text-[26px] font-semibold">See what your target looks like</h2>
                  <p className="mt-2 text-[14px] leading-6 text-[#5f675f]">
                    Pick foods you normally eat and see how they stack up against your {targetCalories} kcal daily target.
                  </p>
                </div>
                <MealCalcTable targetCalories={targetCalories} targetProtein={targetProtein} goal={form.goal} />
              </section>
            )}

            <section className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_16px_48px_rgba(16,21,16,0.07)]">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Finish</p>
                  <h2 className="mt-1 text-[26px] font-semibold">Save your profile</h2>
                  <p className="mt-2 text-[14px] leading-6 text-[#5f675f]">
                    We store your inputs and calculate your targets. You can log your first meal next, or head straight to the dashboard.
                  </p>
                  {status === "error" ? (
                    <p className="mt-3 text-[13px] font-semibold text-[var(--danger)]">
                      {requiredComplete ? "Could not save your profile. Sign in and try again." : "Complete the required body and goal fields first."}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
                  <button
                    onClick={() => handleSave("/snap")}
                    disabled={status === "saving" || !requiredComplete}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-black/10 bg-[#f8f8f3] px-5 py-3 text-[14px] font-bold text-[#173c2b] transition-colors hover:bg-[#eef5f2] disabled:opacity-50"
                  >
                    Save and log meal
                  </button>
                  <button
                    onClick={() => handleSave("/dashboard")}
                    disabled={status === "saving" || !requiredComplete}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#173c2b] px-5 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#0f2a1d] disabled:opacity-60"
                  >
                    {status === "saving" ? "Saving..." : "Save and open dashboard"}
                    <ArrowRight size={15} weight="bold" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-black/10 bg-[#f8f8f3] p-3 text-left transition-colors hover:border-[#0f8b8d]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f8b8d]/40"
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-[#173c2b]">{label}</span>
        <span className="mt-0.5 block text-[12px] leading-5 text-[#5f675f]">{description}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[#173c2b]" : "bg-black/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-200 motion-reduce:transition-none ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
