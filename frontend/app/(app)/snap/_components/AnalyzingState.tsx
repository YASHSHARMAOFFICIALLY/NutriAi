"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function SkeletonRow({ delay }: { delay: number }) {
  return (
    <motion.div
      className="flex items-center justify-between rounded-xl px-4 py-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
    >
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 animate-pulse rounded-full bg-ink/[0.06]" />
        <div className="h-3.5 w-36 animate-pulse rounded-full bg-ink/[0.06]" />
      </div>
      <div className="h-3.5 w-14 animate-pulse rounded-full bg-ink/[0.06]" />
    </motion.div>
  );
}

export function AnalyzingState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col gap-6"
    >
      {/* Status */}
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sage" />
        </span>
        <p className="text-[14px] font-medium text-ink-muted">
          Analyzing <span className="text-ink">&ldquo;{query.slice(0, 40)}{query.length > 40 ? "…" : ""}&rdquo;</span>
        </p>
      </div>

      {/* Skeleton card */}
      <div className="rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_10px_40px_rgba(31,59,45,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
        {/* Fake header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-5 w-44 animate-pulse rounded-full bg-ink/[0.06]" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-ink/[0.06]" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-sage/10" />
        </div>

        {/* Fake macro pills */}
        <div className="mb-5 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-ink/[0.04]"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>

        {/* Fake rows */}
        <div className="flex flex-col">
          {[0.1, 0.2, 0.3, 0.4].map((d) => (
            <SkeletonRow key={d} delay={d} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
