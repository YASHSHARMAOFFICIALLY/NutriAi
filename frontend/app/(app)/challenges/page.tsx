"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Trophy,
  Plus,
  CheckCircle,
  X,
  Fire,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "../_components/AppState";
import {
  abandonChallenge,
  checkInToday,
  listMyChallenge,
  listPresets,
  startChallenge,
} from "@/lib/api/challenges";
import { ApiError } from "@/lib/api/client";
import type { ChallengePreset, UserChallengeDTO } from "@/lib/api/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CATEGORY_COLORS: Record<string, string> = {
  SUGAR:      "bg-pink-50   text-pink-700",
  PROTEIN:    "bg-sage/10   text-sage-600",
  HYDRATION:  "bg-sky-50    text-sky-700",
  CALORIES:   "bg-orange-50 text-orange-700",
  STEPS:      "bg-lime-50   text-lime-700",
  HABIT:      "bg-violet-50 text-violet-700",
};

const DURATION_FILTERS = [
  { label: "All", value: undefined as number | undefined },
  { label: "7 days",  value: 7 },
  { label: "30 days", value: 30 },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function daysLeft(uc: UserChallengeDTO): number {
  const elapsed = uc.daysCheckedIn;
  return Math.max(0, uc.durationDays - elapsed);
}

function pct(uc: UserChallengeDTO): number {
  return Math.min(uc.daysCheckedIn / uc.durationDays, 1);
}

function canCheckIn(uc: UserChallengeDTO): boolean {
  if (uc.status !== "ACTIVE") return false;
  if (!uc.lastCheckInDate) return true;
  const today = new Date().toISOString().slice(0, 10);
  return uc.lastCheckInDate.slice(0, 10) !== today;
}

// ── sub-components ────────────────────────────────────────────────────────────

function ActiveChallengeCard({
  uc,
  onCheckIn,
  onRequestAbandon,
  onAbandon,
  onCancelAbandon,
  busy,
  confirmingAbandon,
}: {
  uc: UserChallengeDTO;
  onCheckIn: () => void;
  onRequestAbandon: () => void;
  onAbandon: () => void;
  onCancelAbandon: () => void;
  busy: boolean;
  confirmingAbandon: boolean;
}) {
  const progress = pct(uc);
  const checkable = canCheckIn(uc);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="rounded-3xl border border-white/70 bg-white/60 p-7 shadow-[0_10px_40px_rgba(31,59,45,0.07),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{uc.challenge?.icon ?? "🏆"}</span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-600">Active challenge</p>
            <h2 className="mt-0.5 font-display text-[20px] font-bold leading-tight text-ink">{uc.title}</h2>
          </div>
        </div>
        <button
          onClick={onRequestAbandon}
          disabled={busy}
          className="shrink-0 rounded-full p-1.5 text-ink-muted/50 transition-colors hover:bg-ink/[0.05] hover:text-ink-muted disabled:opacity-40"
          title="Give up challenge"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[12px]">
          <span className="text-ink-muted">{uc.daysCheckedIn} of {uc.durationDays} days</span>
          <span className="font-semibold text-sage-600">{daysLeft(uc)} days left</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
          <motion.div
            className="h-full rounded-full bg-sage"
            style={{ transformOrigin: "left" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress }}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          />
        </div>
      </div>

      <button
        onClick={onCheckIn}
        disabled={busy || !checkable}
        className={[
          "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold transition-all",
          checkable && !busy
            ? "bg-forest text-cream shadow-[0_4px_16px_rgba(31,59,45,0.22)] hover:opacity-90 active:scale-[0.99]"
            : "bg-ink/[0.05] text-ink-muted/50 cursor-not-allowed",
        ].join(" ")}
      >
        <CheckCircle size={16} weight="fill" />
        {busy ? "Saving…" : checkable ? "Check in for today" : "Already checked in today ✓"}
      </button>

      {confirmingAbandon ? (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[13px] font-semibold text-amber-800">Give up this challenge?</p>
          <p className="mt-0.5 text-[12px] text-amber-700">Your current progress will move to past challenges.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onAbandon}
              disabled={busy}
              className="rounded-full bg-amber-700 px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Saving…" : "Give up"}
            </button>
            <button
              type="button"
              onClick={onCancelAbandon}
              disabled={busy}
              className="rounded-full border border-amber-300 px-3 py-1.5 text-[12px] font-semibold text-amber-800 disabled:opacity-50"
            >
              Keep going
            </button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

function CompletedBanner({ uc }: { uc: UserChallengeDTO }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-forest/20 bg-forest/8 px-5 py-4">
      <Trophy size={20} weight="fill" className="shrink-0 text-forest" />
      <div>
        <p className="text-[14px] font-semibold text-forest">Challenge complete!</p>
        <p className="text-[12px] text-ink-muted">{uc.title} · {uc.durationDays} days</p>
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  onStart,
  busy,
}: {
  preset: ChallengePreset;
  onStart: () => void;
  busy: boolean;
}) {
  const tagColor = CATEGORY_COLORS[preset.category] ?? "bg-ink/5 text-ink-muted";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/60 p-5 backdrop-blur-sm transition-shadow hover:shadow-[0_6px_24px_rgba(31,59,45,0.08)]"
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl leading-none">{preset.icon}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tagColor}`}>
          {preset.durationDays}d
        </span>
      </div>
      <div>
        <p className="text-[14px] font-semibold text-ink leading-snug">{preset.title}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{preset.description}</p>
      </div>
      <button
        onClick={onStart}
        disabled={busy}
        className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-ink/10 py-2 text-[12px] font-semibold text-ink-muted transition-all hover:border-sage/40 hover:bg-sage/8 hover:text-sage-600 disabled:opacity-50"
      >
        <Fire size={13} weight="fill" />
        Start challenge
      </button>
    </motion.div>
  );
}

function CustomCreateForm({
  onSubmit,
  onClose,
  busy,
  error,
}: {
  onSubmit: (title: string, description: string, days: number) => void;
  onClose: () => void;
  busy: boolean;
  error: string | null;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<7 | 14 | 30 | number>(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), description.trim(), days);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="rounded-2xl border border-sage/25 bg-white/80 p-6 backdrop-blur-sm"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-[18px] font-bold text-ink">Create your own</h3>
        <button onClick={onClose} className="rounded-full p-1 text-ink-muted/50 hover:text-ink-muted">
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-ink-muted">Challenge name</span>
          <input
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 30 days no alcohol"
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-sage-600"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-ink-muted">Description (optional)</span>
          <textarea
            maxLength={500}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are the rules?"
            className="resize-none rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-sage-600"
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-ink-muted">Duration</span>
          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={[
                  "flex-1 rounded-xl border py-2.5 text-[13px] font-semibold transition-all",
                  days === d
                    ? "border-sage bg-sage/10 text-sage-600"
                    : "border-ink/10 text-ink-muted hover:border-ink/20",
                ].join(" ")}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-2 text-[12px] text-red-600">
            <Warning size={13} weight="fill" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-[14px] font-semibold text-cream shadow-[0_2px_8px_rgba(31,59,45,0.25)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Creating…" : "Start my challenge"}
        </button>
      </form>
    </motion.div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const [presets, setPresets] = useState<ChallengePreset[]>([]);
  const [myChallenges, setMyChallenges] = useState<UserChallengeDTO[]>([]);
  const [durationFilter, setDurationFilter] = useState<number | undefined>(undefined);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);
  const [presetsError, setPresetsError] = useState<string | null>(null);
  const [mineError, setMineError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customBusy, setCustomBusy] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingAbandonId, setConfirmingAbandonId] = useState<string | null>(null);

  const loadPresets = useCallback(async () => {
    setLoadingPresets(true);
    setPresetsError(null);
    try {
      const data = await listPresets(durationFilter !== undefined ? { durationDays: durationFilter } : undefined);
      setPresets(data);
    } catch {
      setPresetsError("Couldn't load challenges.");
    } finally {
      setLoadingPresets(false);
    }
  }, [durationFilter]);

  const loadMine = useCallback(async () => {
    setLoadingMine(true);
    setMineError(null);
    try {
      const data = await listMyChallenge();
      setMyChallenges(data);
    } catch {
      setMineError("Couldn't load your challenges.");
    } finally {
      setLoadingMine(false);
    }
  }, []);

  useEffect(() => { loadPresets(); }, [loadPresets]);
  useEffect(() => { loadMine(); }, [loadMine]);

  const activeChallenge = myChallenges.find((c) => c.status === "ACTIVE") ?? null;
  const recentCompleted = myChallenges.find((c) => c.status === "COMPLETED") ?? null;

  // Filter presets to exclude the active one if it's a preset.
  const filteredPresets = presets.filter((p) => p.id !== activeChallenge?.challengeId);

  const handleStart = async (preset: ChallengePreset) => {
    setBusyId(preset.id);
    setActionError(null);
    try {
      const uc = await startChallenge({
        challengeId: preset.id,
        title: preset.title,
        description: preset.description,
        durationDays: preset.durationDays,
      });
      setMyChallenges((prev) => [uc, ...prev]);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Couldn't start challenge.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCheckIn = async (ucId: string) => {
    setBusyId(ucId);
    setActionError(null);
    try {
      const updated = await checkInToday(ucId);
      setMyChallenges((prev) => prev.map((c) => (c.id === ucId ? updated : c)));
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Check-in failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAbandon = async (ucId: string) => {
    setBusyId(ucId);
    setActionError(null);
    try {
      const updated = await abandonChallenge(ucId);
      setMyChallenges((prev) => prev.map((c) => (c.id === ucId ? updated : c)));
      setConfirmingAbandonId(null);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Couldn't abandon challenge.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCustomSubmit = async (title: string, description: string, days: number) => {
    setCustomBusy(true);
    setCustomError(null);
    try {
      const uc = await startChallenge({ title, description, durationDays: days });
      setMyChallenges((prev) => [uc, ...prev]);
      setShowCustom(false);
      setActionError(null);
    } catch (e) {
      setCustomError(e instanceof ApiError ? e.message : "Couldn't create challenge.");
    } finally {
      setCustomBusy(false);
    }
  };

  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Header */}
      <header className="mb-10">
        <p className="text-[13px] text-ink-muted">Your progress</p>
        <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
          Challenges
        </h1>
      </header>

      <div className="max-w-2xl space-y-8">
        {actionError ? (
          <InlineNotice title="Challenge update failed" message={actionError} />
        ) : null}

        {/* Active challenge / completed banner */}
        {loadingMine ? (
          <LoadingState className="min-h-40" />
        ) : mineError ? (
          <ErrorState title="Couldn't load your challenges" message={mineError} onRetry={loadMine} />
        ) : activeChallenge ? (
          <ActiveChallengeCard
            uc={activeChallenge}
            onCheckIn={() => handleCheckIn(activeChallenge.id)}
            onRequestAbandon={() => setConfirmingAbandonId(activeChallenge.id)}
            onAbandon={() => handleAbandon(activeChallenge.id)}
            onCancelAbandon={() => setConfirmingAbandonId(null)}
            busy={busyId === activeChallenge.id}
            confirmingAbandon={confirmingAbandonId === activeChallenge.id}
          />
        ) : recentCompleted ? (
          <CompletedBanner uc={recentCompleted} />
        ) : (
          <EmptyState
            title="No active challenge"
            message="Pick a preset or create a small personal challenge to build consistency."
          />
        )}

        {/* Custom challenge form (toggle) */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-[20px] font-bold text-ink">Choose a challenge</h2>
            <button
              onClick={() => setShowCustom((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-[13px] font-semibold text-ink-muted transition-colors hover:border-sage/40 hover:text-sage-600"
            >
              <Plus size={13} weight="bold" />
              Create your own
            </button>
          </div>

          <AnimatePresence>
            {showCustom && (
              <div className="mb-5">
                <CustomCreateForm
                  onSubmit={handleCustomSubmit}
                  onClose={() => setShowCustom(false)}
                  busy={customBusy}
                  error={customError}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Duration filter */}
          <div className="mb-5 flex gap-2">
            {DURATION_FILTERS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setDurationFilter(value)}
                className={[
                  "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-all",
                  durationFilter === value
                    ? "border-sage bg-sage/10 text-sage-600"
                    : "border-ink/10 text-ink-muted hover:border-ink/20",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Preset grid */}
          {loadingPresets ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/40" />
              ))}
            </div>
          ) : presetsError ? (
            <ErrorState title="Couldn't load presets" message={presetsError} onRetry={loadPresets} />
          ) : filteredPresets.length === 0 ? (
            <EmptyState
              title="No presets for this filter"
              message="Try another duration or create your own challenge."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onStart={() => handleStart(preset)}
                  busy={busyId === preset.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Past challenges */}
        {myChallenges.filter((c) => c.status !== "ACTIVE").length > 0 && (
          <div>
            <h2 className="mb-4 font-display text-[18px] font-bold text-ink">Past challenges</h2>
            <div className="flex flex-col gap-2">
              {myChallenges
                .filter((c) => c.status !== "ACTIVE")
                .map((uc) => (
                  <div
                    key={uc.id}
                    className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/50 px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg leading-none">{uc.challenge?.icon ?? "🏅"}</span>
                      <div>
                        <p className="text-[14px] font-medium text-ink">{uc.title}</p>
                        <p className="text-[11px] text-ink-muted">
                          {uc.daysCheckedIn}/{uc.durationDays} days
                        </p>
                      </div>
                    </div>
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-[11px] font-semibold",
                        uc.status === "COMPLETED"
                          ? "bg-forest/10 text-forest"
                          : "bg-ink/[0.06] text-ink-muted",
                      ].join(" ")}
                    >
                      {uc.status === "COMPLETED" ? "Completed 🎉" : "Abandoned"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
