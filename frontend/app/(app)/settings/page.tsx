"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SignOut, Check, X } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { ErrorState, InlineNotice, LoadingState, PrivacyNotice } from "../_components/AppState";
import { SettingsSection, SettingsRow } from "./_components/SettingsSection";
import { Toggle } from "./_components/Toggle";
import { getProfile, updateProfile } from "@/lib/api/profile";
import { logout } from "@/lib/api/account";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const GOALS = ["Lose weight", "Maintain weight", "Build muscle", "Eat healthier"];
const ACTIVITY = ["Sedentary", "Lightly active", "Moderately active", "Very active"];

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function SettingsPage() {
  const router = useRouter();
  const [goal, setGoal] = useState("Build muscle");
  const [activity, setActivity] = useState("Moderately active");
  const [calories, setCalories] = useState("1800");
  const [protein, setProtein] = useState("130");

  const [notifyStreakRisk, setNotifyStreakRisk] = useState(false);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const loadProfile = () => {
    setProfileLoading(true);
    setProfileError("");
    getProfile()
      .then((p) => {
        setNotifyStreakRisk(p.notifyStreakRisk ?? false);
        setNotifyWeeklyDigest(p.notifyWeeklyDigest ?? false);
      })
      .catch(() => {
        setProfileError("Couldn't load your saved privacy and notification preferences.");
      })
      .finally(() => setProfileLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((p) => {
        if (cancelled) return;
        setNotifyStreakRisk(p.notifyStreakRisk ?? false);
        setNotifyWeeklyDigest(p.notifyWeeklyDigest ?? false);
      })
      .catch(() => {
        if (cancelled) return;
        setProfileError("Couldn't load your saved privacy and notification preferences.");
      })
      .finally(() => {
        if (cancelled) return;
        setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveError("");
    try {
      await updateProfile({ notifyStreakRisk, notifyWeeklyDigest });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setSaveError("Couldn't save. Try again.");
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <header className="mb-10">
        <p className="text-[13px] text-ink-muted">Preferences</p>
        <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
          Settings
        </h1>
      </header>

      <div className="flex max-w-3xl flex-col gap-10">
        {profileLoading ? <LoadingState /> : null}
        {profileError ? (
          <ErrorState
            title="Settings unavailable"
            message={profileError}
            onRetry={loadProfile}
          />
        ) : null}

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0 }}>
          <SettingsSection title="Profile" description="Your public name and account details.">
            <SettingsRow label="Name" sublabel="Shown on your dashboard">
              <input
                defaultValue="Yash Sharma"
                className="w-44 rounded-xl border border-ink/[0.08] bg-cream/60 px-3 py-1.5 text-[13px] text-ink outline-none transition focus:border-sage/60 focus:ring-2 focus:ring-sage/10"
              />
            </SettingsRow>
            <SettingsRow label="Email" sublabel="Linked to your Google account" last>
              <span className="text-[13px] text-ink-muted">yash@example.com</span>
            </SettingsRow>
          </SettingsSection>
        </motion.div>

        {/* Nutrition goals */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.08 }}>
          <SettingsSection title="Nutrition goals" description="Used to personalise your daily targets and Coach Ria's advice.">
            <SettingsRow label="Primary goal">
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="rounded-xl border border-ink/[0.08] bg-cream/60 px-3 py-1.5 text-[13px] text-ink outline-none transition focus:border-sage/60"
              >
                {GOALS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </SettingsRow>
            <SettingsRow label="Activity level">
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="rounded-xl border border-ink/[0.08] bg-cream/60 px-3 py-1.5 text-[13px] text-ink outline-none transition focus:border-sage/60"
              >
                {ACTIVITY.map((a) => <option key={a}>{a}</option>)}
              </select>
            </SettingsRow>
            <SettingsRow label="Daily calorie target" sublabel="kcal / day">
              <input
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                type="number"
                className="w-24 rounded-xl border border-ink/[0.08] bg-cream/60 px-3 py-1.5 text-[13px] text-ink outline-none transition focus:border-sage/60 focus:ring-2 focus:ring-sage/10"
              />
            </SettingsRow>
            <SettingsRow label="Daily protein target" sublabel="grams / day" last>
              <input
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                type="number"
                className="w-24 rounded-xl border border-ink/[0.08] bg-cream/60 px-3 py-1.5 text-[13px] text-ink outline-none transition focus:border-sage/60 focus:ring-2 focus:ring-sage/10"
              />
            </SettingsRow>
          </SettingsSection>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.16 }}>
          <SettingsSection title="Notifications" description="Email nudges to keep your streak alive.">
            <SettingsRow label="Streak reminders" sublabel="Email when your streak is at risk (past 7 PM, no meal logged)">
              <Toggle value={notifyStreakRisk} onChange={setNotifyStreakRisk} disabled={profileLoading} />
            </SettingsRow>
            <SettingsRow label="Weekly digest" sublabel="Sunday morning summary of last week" last>
              <Toggle value={notifyWeeklyDigest} onChange={setNotifyWeeklyDigest} disabled={profileLoading} />
            </SettingsRow>
          </SettingsSection>
        </motion.div>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}>
          <SettingsSection title="Privacy" description="Health-adjacent data should stay predictable and contained.">
            <SettingsRow label="AI context" sublabel="Coach Ria can use your logged meals, targets, and recent nutrition totals.">
              <span className="rounded-full bg-forest/10 px-3 py-1 text-[11px] font-semibold text-forest">
                Meal context only
              </span>
            </SettingsRow>
            <SettingsRow label="Browser session" sublabel="Access tokens stay in memory instead of long-lived browser storage.">
              <span className="rounded-full bg-sage/10 px-3 py-1 text-[11px] font-semibold text-sage-600">
                Hardened
              </span>
            </SettingsRow>
            <SettingsRow label="Data requests" sublabel="Export and account deletion need a backend workflow before launch." last>
              <span className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-semibold text-ink-muted">
                Planned
              </span>
            </SettingsRow>
            <div className="mt-4">
              <PrivacyNotice
                title="Sensitive nutrition data"
                message="Weight, meals, goals, and email preferences are account data. This UI avoids fake destructive actions until the backend can audit and complete them safely."
              />
            </div>
          </SettingsSection>
        </motion.div>

        {/* Save */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.24 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-[14px] font-semibold shadow-[0_4px_20px_rgba(31,59,45,0.25)] transition-all active:scale-[0.99] disabled:opacity-60 ${
              saveStatus === "saved"
                ? "bg-sage text-cream"
                : saveStatus === "error"
                ? "border border-amber-400 bg-white text-amber-700"
                : "bg-forest text-cream hover:opacity-90"
            }`}
          >
            {saveStatus === "saving" && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" />
            )}
            {saveStatus === "saved" && <Check size={14} weight="bold" />}
            {saveStatus === "error" && <X size={14} weight="bold" />}
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Retry" : "Save changes"}
          </button>
          {saveStatus === "error" && (
            <InlineNotice title="Save failed" message={saveError} />
          )}
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}>
          <SettingsSection title="Account" description="Manage your session and data.">
            <SettingsRow label="Sign out" sublabel="Log out of this device">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-1.5 rounded-xl border border-ink/[0.08] px-4 py-1.5 text-[13px] font-medium text-ink-muted transition hover:border-ink/20 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SignOut size={14} />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </SettingsRow>
            <SettingsRow label="Delete account" sublabel="Requires audited backend deletion before production launch" last>
              <span className="text-[13px] font-medium text-ink-muted">Not enabled</span>
            </SettingsRow>
          </SettingsSection>
        </motion.div>

      </div>
    </div>
  );
}
