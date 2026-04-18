"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { InputPanel } from "./_components/InputPanel";
import { AnalyzingState } from "./_components/AnalyzingState";
import { ResultCard, MOCK_RESULT } from "./_components/ResultCard";

type SnapState = "idle" | "analyzing" | "result" | "logged";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function LoggedConfirmation({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex flex-col items-center gap-6 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10"
      >
        <Check size={28} weight="bold" className="text-forest" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
        className="flex flex-col gap-2"
      >
        <h2 className="font-display text-[26px] font-bold text-ink">Meal logged!</h2>
        <p className="text-[15px] text-ink-muted">Added to today&apos;s log. Keep it up.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.35 }}
        className="flex flex-col gap-3 w-full"
      >
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest py-4 text-[15px] font-semibold text-cream shadow-[0_4px_20px_rgba(31,59,45,0.25)] transition-all hover:opacity-90 active:scale-[0.99]"
        >
          Log another meal
        </button>
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-medium text-ink-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          Back to dashboard
          <ArrowRight size={13} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function SnapPage() {
  const [state, setState] = useState<SnapState>("idle");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"describe" | "photo">("describe");

  const handleAnalyze = () => {
    setState("analyzing");
    setTimeout(() => setState("result"), 1800);
  };

  const handleLog = () => setState("logged");
  const handleReset = () => {
    setState("idle");
    setQuery("");
  };

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <header className="mb-10">
        <p className="text-[13px] text-ink-muted">Snap &amp; Log</p>
        <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
          What did you eat?
        </h1>
      </header>

      <div className="max-w-xl">
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <InputPanel
                query={query}
                tab={tab}
                onQueryChange={setQuery}
                onTabChange={setTab}
                onAnalyze={handleAnalyze}
              />
            </motion.div>
          )}

          {state === "analyzing" && (
            <AnalyzingState key="analyzing" query={query || "your meal"} />
          )}

          {state === "result" && (
            <ResultCard
              key="result"
              result={MOCK_RESULT}
              onLog={handleLog}
              onReset={handleReset}
            />
          )}

          {state === "logged" && (
            <LoggedConfirmation key="logged" onReset={handleReset} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
