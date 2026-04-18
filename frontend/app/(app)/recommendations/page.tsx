"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkle, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { RecommendationCard, type Recommendation } from "./_components/RecommendationCard";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ALL: Recommendation[] = [
  {
    id: "1",
    name: "Grilled salmon with quinoa",
    reason: "You're 76g short on protein today — this closes the gap cleanly without pushing carbs over.",
    tag: "High Protein",
    kcal: 520,
    protein: 42,
    carbs: 38,
    fat: 18,
    prepTime: "20 min",
  },
  {
    id: "2",
    name: "Greek yogurt & berry bowl",
    reason: "Under 300 kcal and 22g protein — ideal as a second breakfast or afternoon snack.",
    tag: "Quick",
    kcal: 280,
    protein: 22,
    carbs: 34,
    fat: 6,
    prepTime: "5 min",
  },
  {
    id: "3",
    name: "Chicken & sweet potato",
    reason: "Your Saturday dinner average is high in fat. This swaps that pattern with a cleaner macro split.",
    tag: "Balanced",
    kcal: 480,
    protein: 38,
    carbs: 46,
    fat: 10,
    prepTime: "25 min",
  },
  {
    id: "4",
    name: "Egg white omelette",
    reason: "Fast, high-protein breakfast that keeps morning calories low, leaving room for a bigger lunch.",
    tag: "Low Cal",
    kcal: 180,
    protein: 24,
    carbs: 4,
    fat: 5,
    prepTime: "10 min",
  },
  {
    id: "5",
    name: "Tuna & avocado rice bowl",
    reason: "Omega-3s + complex carbs — great for muscle recovery on days you train.",
    tag: "High Protein",
    kcal: 460,
    protein: 36,
    carbs: 44,
    fat: 14,
    prepTime: "15 min",
  },
  {
    id: "6",
    name: "Lentil soup with bread",
    reason: "High fibre, plant-based protein — you've had no legumes this week.",
    tag: "Balanced",
    kcal: 390,
    protein: 20,
    carbs: 58,
    fat: 7,
    prepTime: "30 min",
  },
];

const TAGS = ["All", "High Protein", "Low Cal", "Quick", "Balanced"];

export default function RecommendationsPage() {
  const [activeTag, setActiveTag] = useState("All");

  const filtered = activeTag === "All" ? ALL : ALL.filter((r) => r.tag === activeTag);

  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Header */}
      <header className="mb-8">
        <p className="text-[13px] text-ink-muted">Personalised for you</p>
        <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
          Recommendations
        </h1>
      </header>

      {/* Ria insight banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mb-6 flex items-start gap-4 rounded-2xl bg-forest p-5 shadow-[0_8px_32px_rgba(31,59,45,0.2)]"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sage/30 bg-sage/20">
          <Sparkle size={14} weight="fill" className="text-sage" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-sage">Coach Ria</p>
          <p className="mt-1 text-[14px] leading-relaxed text-white/80">
            Based on today&apos;s intake, you need more protein and you&apos;re 560 kcal under goal.
            I&apos;ve picked meals that close both gaps without going over.
          </p>
        </div>
        <Link
          href="/coach"
          className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-sage transition-opacity hover:opacity-75"
        >
          Ask Ria
          <ArrowRight size={12} weight="bold" />
        </Link>
      </motion.div>

      {/* Filter chips */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.1 }}
        className="mb-6 flex flex-wrap gap-2"
      >
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={[
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200",
              activeTag === tag
                ? "bg-forest text-cream shadow-[0_2px_8px_rgba(31,59,45,0.2)]"
                : "border border-ink/[0.08] bg-white/60 text-ink-muted backdrop-blur-sm hover:text-ink",
            ].join(" ")}
          >
            {tag}
          </button>
        ))}
      </motion.div>

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTag}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((rec, i) => (
            <RecommendationCard key={rec.id} rec={rec} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
