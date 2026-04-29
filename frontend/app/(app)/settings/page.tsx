"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AddressBook, Bell, CreditCard, Gear, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { createCheckout, getMyPlan, type UserPlan } from "@/lib/api/payments";
import { deleteProfile, getProfile, updateProfile } from "@/lib/api/profile";
import { createTelegramLink, getTelegramStatus, unlinkTelegram, type TelegramLink, type TelegramStatus } from "@/lib/api/telegram";
import type { ActivityLevel, Goal, Sex, UserProfile } from "@/lib/api/types";
import { CheckRow, PageHeader, Panel, Skeleton, Stat } from "../_components/ui";
import { sexLabels, activityLabels, goalLabels } from "@/lib/enumLabels";
import { useToast } from "@/lib/toast";

type ProfileForm = {
  sex: Sex | "";
  birthYear: string;
  heightCm: string;
  weightKg: string;
  activityLevel: ActivityLevel | "";
  goal: Goal | "";
  targetWeightKg: string;
  dailyBudgetUsd: string;
  timezone: string;
  dailyCalorieTarget: string;
  proteinTargetG: string;
  carbsTargetG: string;
  fatTargetG: string;
  dietaryPrefs: string;
  allergies: string;
  notifyStreakRisk: boolean;
  notifyWeeklyDigest: boolean;
};

function formFromProfile(apiProfile?: UserProfile | null): ProfileForm {
  return {
    sex: apiProfile?.sex ?? "",
    birthYear: apiProfile?.birthYear ? String(apiProfile.birthYear) : "",
    heightCm: apiProfile?.heightCm ? String(apiProfile.heightCm) : "",
    weightKg: apiProfile?.weightKg ? String(apiProfile.weightKg) : "",
    activityLevel: apiProfile?.activityLevel ?? "",
    goal: apiProfile?.goal ?? "",
    targetWeightKg: apiProfile?.targetWeightKg ? String(apiProfile.targetWeightKg) : "",
    dailyBudgetUsd: apiProfile?.dailyBudgetUsd ? String(apiProfile.dailyBudgetUsd) : "",
    timezone: apiProfile?.timezone ?? "",
    dailyCalorieTarget: apiProfile?.dailyCalorieTarget ? String(apiProfile.dailyCalorieTarget) : "",
    proteinTargetG: apiProfile?.proteinTargetG ? String(apiProfile.proteinTargetG) : "",
    carbsTargetG: apiProfile?.carbsTargetG ? String(apiProfile.carbsTargetG) : "",
    fatTargetG: apiProfile?.fatTargetG ? String(apiProfile.fatTargetG) : "",
    dietaryPrefs: (apiProfile?.dietaryPrefs ?? []).join(", "),
    allergies: (apiProfile?.allergies ?? []).join(", "),
    notifyStreakRisk: apiProfile?.notifyStreakRisk ?? true,
    notifyWeeklyDigest: apiProfile?.notifyWeeklyDigest ?? true,
  };
}

function numberOrNull(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function listFromCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileForm>(formFromProfile());
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [telegramLink, setTelegramLink] = useState<TelegramLink | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [source, setSource] = useState<"loading" | "live" | "error">("loading");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProfile(),
      getMyPlan().catch(() => null),
      getTelegramStatus().catch(() => null),
    ])
      .then(([apiProfile, apiPlan, tgStatus]) => {
        if (cancelled) return;
        setForm(formFromProfile(apiProfile));
        setPlan(apiPlan);
        setTelegramStatus(tgStatus);
        setSource("live");
      })
      .catch(() => setSource("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const derived = useMemo(() => {
    const sex = form.sex;
    const weight = numberOrNull(form.weightKg) ?? 0;
    const height = numberOrNull(form.heightCm) ?? 0;
    const birthYear = numberOrNull(form.birthYear);
    if (!weight || !height || !birthYear) return { bmr: 0, tdee: 0 };
    const age = new Date().getFullYear() - birthYear;
    const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (sex === "FEMALE" ? -161 : 5));
    const activityMultiplier = form.activityLevel === "ACTIVE" ? 1.725 : form.activityLevel === "MODERATE" ? 1.55 : form.activityLevel === "LIGHT" ? 1.375 : 1.2;
    return { bmr, tdee: Math.round(bmr * activityMultiplier) };
  }, [form]);

  function updateField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateProfile({
        sex: form.sex || null,
        birthYear: numberOrNull(form.birthYear),
        heightCm: numberOrNull(form.heightCm),
        weightKg: numberOrNull(form.weightKg),
        activityLevel: form.activityLevel || null,
        goal: form.goal || null,
        targetWeightKg: numberOrNull(form.targetWeightKg),
        dailyBudgetUsd: numberOrNull(form.dailyBudgetUsd),
        timezone: form.timezone || null,
        dailyCalorieTarget: numberOrNull(form.dailyCalorieTarget),
        proteinTargetG: numberOrNull(form.proteinTargetG),
        carbsTargetG: numberOrNull(form.carbsTargetG),
        fatTargetG: numberOrNull(form.fatTargetG),
        dietaryPrefs: listFromCsv(form.dietaryPrefs),
        allergies: listFromCsv(form.allergies),
        notifyStreakRisk: form.notifyStreakRisk,
        notifyWeeklyDigest: form.notifyWeeklyDigest,
      });
      setForm(formFromProfile(updated));
      toast("success", "Profile saved.");
      setSource("live");
    } catch {
      toast("error", "Could not save profile.");
      setSource("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProfile() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setSaving(true);
    try {
      await deleteProfile();
      setForm(formFromProfile(null));
      setConfirmDelete(false);
      toast("success", "Nutrition profile deleted.");
      setSource("live");
    } catch {
      toast("error", "Could not delete profile.");
      setSource("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateTelegramLink() {
    setSaving(true);
    try {
      const link = await createTelegramLink();
      setTelegramLink(link);
      toast("success", "Telegram link created.");
      if (link.deepLink) window.open(link.deepLink, "_blank", "noopener,noreferrer");
    } catch {
      toast("error", "Could not create Telegram link.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnlinkTelegram() {
    setSaving(true);
    try {
      await unlinkTelegram();
      setTelegramStatus((current) => current ? { ...current, linked: false, account: null } : current);
      setTelegramLink(null);
      toast("success", "Telegram disconnected.");
    } catch {
      toast("error", "Could not disconnect Telegram.");
    } finally {
      setSaving(false);
    }
  }

  const fields: Array<[keyof ProfileForm, string]> = [
    ["sex", "Sex"],
    ["birthYear", "Birth year"],
    ["heightCm", "Height"],
    ["weightKg", "Current weight"],
    ["activityLevel", "Activity"],
    ["goal", "Goal"],
    ["targetWeightKg", "Target weight"],
    ["dailyBudgetUsd", "Budget"],
    ["timezone", "Timezone"],
  ];
  const isPro = plan?.tier === "PRO" && (plan.status === "ACTIVE" || plan.status === "PAST_DUE");
  const inputClass = "mt-2 w-full rounded-lg border border-border bg-surface-alt px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-teal";
  const hubItems = [
    { label: "Profile", value: form.goal ? goalLabels[form.goal] : "Incomplete", icon: AddressBook },
    { label: "Targets", value: form.dailyCalorieTarget ? `${form.dailyCalorieTarget} kcal` : "Not set", icon: Gear },
    { label: "Plan", value: isPro ? "Pro active" : "Free", icon: CreditCard },
    { label: "Notifications", value: form.notifyWeeklyDigest || form.notifyStreakRisk ? "Enabled" : "Off", icon: Bell },
  ];

  async function handleUpgrade() {
    setSaving(true);
    try {
      const { paymentLink } = await createCheckout("monthly");
      if (paymentLink) window.location.href = paymentLink;
    } catch {
      toast("error", "Could not start checkout.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow="Account"
        title="Settings and subscription"
        description="Manage the profile data that powers targets, recommendations, notifications, Telegram, and your plan."
      />
      {source === "error" ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[#b7791f]">Could not load or save settings. Sign in and try again.</p>
        </Panel>
      ) : null}

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {hubItems.map(({ label, value, icon: Icon }) => (
          <Panel key={label} className="p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-alt text-forest">
                <Icon size={19} weight="bold" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
                <p className="mt-1 text-[14px] font-bold text-forest">{value}</p>
              </div>
            </div>
          </Panel>
        ))}
      </section>

      {source === "loading" ? (
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </section>
      ) : (
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <Stat label="BMR" value={derived.bmr ? `${derived.bmr}` : "-"} sub="Mifflin-St Jeor" />
          <Stat label="TDEE" value={derived.tdee ? `${derived.tdee}` : "-"} sub="Activity-adjusted" />
          <Stat label="Calorie target" value={form.dailyCalorieTarget || "-"} sub="Current profile" />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Panel className="p-6">
          <h2 className="mb-6 text-[22px] font-bold tracking-tight text-forest">Profile inputs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map(([key, label]) => {
              const selectMap = key === "sex" ? sexLabels : key === "activityLevel" ? activityLabels : key === "goal" ? goalLabels : null;
              if (selectMap) {
                return (
                  <label key={key} className="block">
                    <span className="text-[12px] font-bold text-muted">{label}</span>
                    <select className={inputClass} value={String(form[key])} onChange={(event) => updateField(key, event.target.value as ProfileForm[typeof key])}>
                      <option value="">Select...</option>
                      {Object.entries(selectMap).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </select>
                  </label>
                );
              }
              return (
                <label key={key} className="block">
                  <span className="text-[12px] font-bold text-muted">{label}</span>
                  <input className={inputClass} value={String(form[key])} onChange={(event) => updateField(key, event.target.value as ProfileForm[typeof key])} />
                </label>
              );
            })}
          </div>
          <button onClick={handleSave} disabled={saving} className="mt-6 rounded-lg bg-forest px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-forest-soft disabled:opacity-60">{saving ? "Saving..." : "Save profile"}</button>
        </Panel>

        <div className="space-y-5">
          <Panel className="overflow-hidden">
            <div className="border-b border-border bg-surface-alt p-5">
              <div className="flex items-center gap-3">
                <CreditCard size={22} weight="bold" className="text-forest" />
                <div>
                  <h2 className="text-[20px] font-bold tracking-tight text-forest">Subscription</h2>
                  <p className="mt-1 text-[12px] font-semibold text-muted">{isPro ? "Pro features are active" : "Free plan"}</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-[13px] leading-6 text-muted">
                {isPro ? "You have unlimited analysis, coaching, recommendations, and family workflows." : "Upgrade when you want unlimited food analysis, coach context, ranked meal ideas, and family sharing."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {isPro ? (
                  <Link href="/pricing" className="rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-[12px] font-bold text-forest">View plan</Link>
                ) : (
                  <button onClick={handleUpgrade} disabled={saving} className="rounded-lg bg-[#d7ff68] px-4 py-2.5 text-[12px] font-bold text-forest disabled:opacity-60">Upgrade to Pro</button>
                )}
                <Link href="/pricing" className="rounded-lg border border-border bg-white px-4 py-2.5 text-[12px] font-bold text-forest">Compare plans</Link>
              </div>
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="mb-4 text-[22px] font-bold tracking-tight text-forest">Macro targets</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Calories", form.dailyCalorieTarget],
                ["Protein", `${form.proteinTargetG}g`],
                ["Carbs", `${form.carbsTargetG}g`],
                ["Fat", `${form.fatTargetG}g`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-surface-alt p-3.5">
                  <p className="text-[18px] font-bold text-forest">{value}</p>
                  <p className="text-[11px] font-medium text-muted">{label}</p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="mb-4 text-[22px] font-bold tracking-tight text-forest">Preferences</h2>
            <div className="space-y-3">
              <label className="block">
                <span className="text-[12px] font-bold text-muted">Dietary preferences</span>
                <input className={inputClass} value={form.dietaryPrefs} onChange={(event) => updateField("dietaryPrefs", event.target.value)} />
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-muted">Allergies</span>
                <input className={inputClass} value={form.allergies} onChange={(event) => updateField("allergies", event.target.value)} />
              </label>
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="mb-4 text-[22px] font-bold tracking-tight text-forest">Notifications</h2>
            <div className="space-y-2">
              <button onClick={() => updateField("notifyStreakRisk", !form.notifyStreakRisk)} className="w-full text-left"><CheckRow>{form.notifyStreakRisk ? "Streak risk email on" : "Streak risk email off"}</CheckRow></button>
              <button onClick={() => updateField("notifyWeeklyDigest", !form.notifyWeeklyDigest)} className="w-full text-left"><CheckRow>{form.notifyWeeklyDigest ? "Weekly digest on" : "Weekly digest off"}</CheckRow></button>
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-alt text-forest">
                <PaperPlaneTilt size={19} weight="bold" />
              </span>
              <div>
                <h2 className="text-[20px] font-bold tracking-tight text-forest">Telegram</h2>
                <p className="mt-1 text-[12px] font-semibold text-muted">
                  {telegramStatus?.linked ? "Connected" : "Optional quick logging"}
                </p>
              </div>
            </div>
            <p className="text-[13px] leading-6 text-muted">
              {telegramStatus?.linked
                ? `Linked${telegramStatus.account?.username ? ` to @${telegramStatus.account.username}` : ""}.`
                : "Connect only if you want meal logging from Telegram."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {telegramStatus?.linked ? (
                <button onClick={handleUnlinkTelegram} disabled={saving} className="rounded-lg border border-border bg-white px-4 py-2.5 text-[12px] font-bold text-forest disabled:opacity-60">Disconnect</button>
              ) : (
                <button onClick={handleCreateTelegramLink} disabled={saving} className="rounded-lg bg-forest px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-60">Connect Telegram</button>
              )}
              {telegramLink?.deepLink ? (
                <a href={telegramLink.deepLink} target="_blank" rel="noreferrer" className="rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-[12px] font-bold text-forest">Open bot</a>
              ) : null}
            </div>
          </Panel>
          <Panel className="border-amber-200 p-5">
            <h2 className="mb-2 text-[22px] font-bold text-amber-700 tracking-tight">Danger zone</h2>
            <p className="text-[13px] leading-6 text-muted">Delete the saved nutrition profile. This does not delete the login account, meals, or history.</p>
            <button onClick={handleDeleteProfile} disabled={saving} className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] font-bold text-amber-700 transition-all hover:bg-amber-100 hover:border-amber-300 disabled:opacity-60">
              {confirmDelete ? "Confirm delete profile" : "Delete profile"}
            </button>
            {confirmDelete ? <p className="mt-2 text-[12px] font-semibold text-amber-700">Click again to confirm.</p> : null}
          </Panel>
        </div>
      </section>
    </div>
  );
}
