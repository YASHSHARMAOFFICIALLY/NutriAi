"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, SignOut, Trash } from "@phosphor-icons/react/dist/ssr";
import { SettingsSection, SettingsRow } from "./_components/SettingsSection";
import { Toggle } from "./_components/Toggle";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const GOALS = ["Lose weight", "Maintain weight", "Build muscle", "Eat healthier"];
const ACTIVITY = ["Sedentary", "Lightly active", "Moderately active", "Very active"];

export default function SettingsPage() {
  const [goal, setGoal] = useState("Build muscle");
  const [activity, setActivity] = useState("Moderately active");
  const [calories, setCalories] = useState("1800");
  const [protein, setProtein] = useState("130");

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <header className="mb-10">
        <p className="text-[13px] text-ink-muted">Preferences</p>
        <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
          Settings
        </h1>
      </header>

      <div className="flex max-w-3xl flex-col gap-10">

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
          <SettingsSection title="Notifications" description="Choose what Ria alerts you about.">
            <SettingsRow label="Daily summary" sublabel="End-of-day recap from Coach Ria">
              <Toggle defaultOn />
            </SettingsRow>
            <SettingsRow label="Streak reminders" sublabel="Nudge if you haven't logged by 8 PM">
              <Toggle defaultOn />
            </SettingsRow>
            <SettingsRow label="Protein alerts" sublabel="Warn when you're falling short" last>
              <Toggle />
            </SettingsRow>
          </SettingsSection>
        </motion.div>

        {/* Save */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.22 }}>
          <button className="flex items-center gap-2 rounded-2xl bg-forest px-6 py-3 text-[14px] font-semibold text-cream shadow-[0_4px_20px_rgba(31,59,45,0.25)] transition-all hover:opacity-90 active:scale-[0.99]">
            Save changes
          </button>
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.28 }}>
          <SettingsSection title="Account" description="Manage your session and data.">
            <SettingsRow label="Sign out" sublabel="Log out of this device">
              <button className="flex items-center gap-1.5 rounded-xl border border-ink/[0.08] px-4 py-1.5 text-[13px] font-medium text-ink-muted transition hover:border-ink/20 hover:text-ink">
                <SignOut size={14} />
                Sign out
              </button>
            </SettingsRow>
            <SettingsRow label="Delete account" sublabel="Permanently remove your data" last>
              <button className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-1.5 text-[13px] font-medium text-red-500 transition hover:bg-red-50">
                <Trash size={14} />
                Delete
              </button>
            </SettingsRow>
          </SettingsSection>
        </motion.div>

      </div>
    </div>
  );
}
