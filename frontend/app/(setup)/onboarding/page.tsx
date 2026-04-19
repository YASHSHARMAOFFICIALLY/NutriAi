"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { StepGoal } from "./_components/StepGoal";
import { StepActivity } from "./_components/StepActivity";
import { StepTargets } from "./_components/StepTargets";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CALORIE_MAP: Record<string, Record<string, string>> = {
  lose:     { sedentary: "1400", light: "1550", moderate: "1700", very: "1900" },
  maintain: { sedentary: "1700", light: "1900", moderate: "2100", very: "2400" },
  muscle:   { sedentary: "2000", light: "2200", moderate: "2500", very: "2800" },
  health:   { sedentary: "1700", light: "1900", moderate: "2100", very: "2300" },
};
const PROTEIN_MAP: Record<string, string> = {
  lose: "100", maintain: "110", muscle: "150", health: "100",
};

const STEPS = [
  { title: "What's your goal?",        sub: "This shapes your daily targets." },
  { title: "How active are you?",      sub: "Be honest — we'll calibrate from here." },
  { title: "Set your daily targets",   sub: "Pre-filled for you — tweak if needed." },
];

export default function OnboardingPage() {
  const [step, setStep]         = useState(0);
  const [direction, setDir]     = useState(1);
  const [goal, setGoal]         = useState("muscle");
  const [activity, setActivity] = useState("moderate");
  const [calories, setCalories] = useState("2100");
  const [protein, setProtein]   = useState("150");
  const [done, setDone]         = useState(false);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    if (next === 2) {
      setCalories(CALORIE_MAP[goal]?.[activity] ?? "2000");
      setProtein(PROTEIN_MAP[goal] ?? "120");
    }
    setStep(next);
  };

  const canNext = step === 0 ? !!goal : step === 1 ? !!activity : !!calories && !!protein;

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex w-full max-w-sm flex-col items-center gap-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-forest/10"
          >
            <Check size={32} weight="bold" className="text-forest" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.25 }}
          >
            <h1 className="font-display text-[30px] font-bold text-ink">You&apos;re all set!</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              Coach Ria is ready. Start by logging your first meal.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.4 }}
            className="flex w-full flex-col gap-3"
          >
            <Link
              href="/snap"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest py-4 text-[15px] font-semibold text-cream shadow-[0_4px_20px_rgba(31,59,45,0.25)] transition-all hover:opacity-90"
            >
              Log my first meal
              <ArrowRight size={15} weight="bold" />
            </Link>
            <Link
              href="/dashboard"
              className="text-[13px] text-ink-muted transition-colors hover:text-ink"
            >
              Go to dashboard
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest">
            <Sparkle size={13} weight="fill" className="text-cream" />
          </div>
          <span className="font-display text-[16px] font-bold text-ink">NutriAI</span>
        </div>

        {/* Step dots */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-forest" : i < step ? "w-3 bg-sage" : "w-3 bg-ink/[0.1]"
              }`}
            />
          ))}
          <span className="ml-auto text-[12px] text-ink-muted">{step + 1} / {STEPS.length}</span>
        </div>

        {/* Step header */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`header-${step}`}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mb-6"
          >
            <h1 className="font-display text-[26px] font-bold leading-tight text-ink">
              {STEPS[step].title}
            </h1>
            <p className="mt-1 text-[13px] text-ink-muted">{STEPS[step].sub}</p>
          </motion.div>
        </AnimatePresence>

        {/* Step content */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            {step === 0 && <StepGoal value={goal} onChange={setGoal} />}
            {step === 1 && <StepActivity value={activity} onChange={setActivity} />}
            {step === 2 && (
              <StepTargets
                calories={calories}
                protein={protein}
                onCalories={setCalories}
                onProtein={setProtein}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => go(step - 1)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => (step < STEPS.length - 1 ? go(step + 1) : setDone(true))}
            disabled={!canNext}
            className={[
              "flex items-center gap-2 rounded-2xl px-6 py-3 text-[14px] font-semibold transition-all",
              canNext
                ? "bg-forest text-cream shadow-[0_4px_16px_rgba(31,59,45,0.25)] hover:opacity-90 active:scale-[0.99]"
                : "cursor-not-allowed bg-ink/[0.06] text-ink-muted/50",
            ].join(" ")}
          >
            {step < STEPS.length - 1 ? "Continue" : "Finish setup"}
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>

      </div>
    </div>
  );
}
