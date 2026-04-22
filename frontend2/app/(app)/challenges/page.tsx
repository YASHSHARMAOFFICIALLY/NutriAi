"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Flag, XCircle } from "@phosphor-icons/react/dist/ssr";
import { abandonChallenge, checkInToday, listMyChallenge, listPresets, startChallenge } from "@/lib/api/challenges";
import type { ChallengePreset, UserChallengeDTO } from "@/lib/api/types";
import { challenge } from "../_components/mock-data";
import { PageHeader, Panel, SourceBadge } from "../_components/ui";

const fallbackPresets = [
  { id: "protein", title: "Protein floor", category: "PROTEIN", durationDays: 7, description: "Hit a minimum protein target.", slug: "protein-floor", icon: "protein", createdAt: "" },
  { id: "sugar", title: "No late sugar", category: "SUGAR", durationDays: 14, description: "Avoid late sugar snacks.", slug: "no-late-sugar", icon: "sugar", createdAt: "" },
  { id: "hydration", title: "Hydration baseline", category: "HYDRATION", durationDays: 7, description: "Keep hydration consistent.", slug: "hydration", icon: "water", createdAt: "" },
  { id: "habit", title: "Log every dinner", category: "HABIT", durationDays: 30, description: "Log dinner every day.", slug: "log-dinner", icon: "habit", createdAt: "" },
] satisfies ChallengePreset[];

type ActiveChallenge = {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  daysCheckedIn: number;
  lastCheckInDate: string;
  status: string;
  category: string;
};

function fromUserChallenge(item: UserChallengeDTO): ActiveChallenge {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    durationDays: item.durationDays,
    daysCheckedIn: item.daysCheckedIn,
    lastCheckInDate: item.lastCheckInDate ?? "",
    status: item.status,
    category: item.challenge?.category ?? "HABIT",
  };
}

export default function ChallengesPage() {
  const [active, setActive] = useState<ActiveChallenge>({
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    durationDays: challenge.durationDays,
    daysCheckedIn: challenge.daysCheckedIn,
    lastCheckInDate: challenge.lastCheckInDate,
    status: challenge.status,
    category: challenge.category,
  });
  const [presets, setPresets] = useState<ChallengePreset[]>(fallbackPresets);
  const [past, setPast] = useState<UserChallengeDTO[]>([]);
  const [source, setSource] = useState<"live" | "fallback">("fallback");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listMyChallenge("ACTIVE").catch(() => []),
      listMyChallenge().catch(() => []),
      listPresets().catch(() => fallbackPresets),
    ])
      .then(([activeRows, allRows, presetRows]) => {
        if (cancelled) return;
        if (activeRows[0]) setActive(fromUserChallenge(activeRows[0]));
        setPast(allRows.filter((row) => row.status !== "ACTIVE"));
        setPresets(presetRows.length ? presetRows : fallbackPresets);
        setSource("live");
      })
      .catch(() => setSource("fallback"));
    return () => {
      cancelled = true;
    };
  }, []);

  const canCheckIn = active.lastCheckInDate !== new Date().toISOString().slice(0, 10);
  const pastRows = past.length ? past.map((row) => ({
    title: row.title,
    status: row.status,
    progress: `${row.daysCheckedIn}/${row.durationDays}`,
    updated: new Date(row.updatedAt).toLocaleDateString(),
  })) : [
    { title: "Log every lunch", status: "COMPLETED", progress: "7/7", updated: "demo" },
    { title: "No late sugar", status: "ABANDONED", progress: "4/14", updated: "demo" },
  ];
  const progressPct = Math.min(100, Math.round((active.daysCheckedIn / active.durationDays) * 100));

  async function handleCheckIn() {
    setBusy(true);
    try {
      const updated = await checkInToday(active.id);
      setActive(fromUserChallenge(updated));
      setSource("live");
    } catch {
      setSource("fallback");
    } finally {
      setBusy(false);
    }
  }

  async function handleStart(preset: ChallengePreset) {
    setBusy(true);
    try {
      const created = await startChallenge({
        challengeId: preset.id,
        title: preset.title,
        description: preset.description,
        durationDays: preset.durationDays,
      });
      setActive(fromUserChallenge(created));
      setSource("live");
    } catch {
      setSource("fallback");
    } finally {
      setBusy(false);
    }
  }

  async function handleAbandon() {
    setBusy(true);
    try {
      const abandoned = await abandonChallenge(active.id);
      setPast((current) => [abandoned, ...current]);
      setActive({
        id: challenge.id,
        title: "No active challenge",
        description: "Start a preset below to begin a new habit loop.",
        durationDays: 7,
        daysCheckedIn: 0,
        lastCheckInDate: "",
        status: "ACTIVE",
        category: "HABIT",
      });
      setSource("live");
    } catch {
      setSource("fallback");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Challenges" title="Active habit check-in" />

      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Panel className="overflow-hidden">
          <div className="bg-[#173c2b] p-5 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <SourceBadge label={active.category.toLowerCase()} />
                  <SourceBadge label={active.status.toLowerCase()} />
                  <SourceBadge label={source} />
                </div>
                <h2 className="text-[36px] font-semibold leading-tight">{active.title}</h2>
                <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/72">{active.description}</p>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={!canCheckIn || busy}
                className={`flex items-center justify-center gap-2 rounded-md px-5 py-3 text-[14px] font-bold ${canCheckIn ? "bg-[#d7ff68] text-[#101510]" : "bg-white/12 text-white/60"} disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <CheckCircle size={17} weight="fill" />
                {canCheckIn ? "Check in today" : "Checked in"}
              </button>
              <button
                onClick={handleAbandon}
                disabled={busy || active.id === challenge.id}
                className="rounded-md border border-white/20 px-5 py-3 text-[14px] font-bold text-white/78 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Abandon
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="mb-2 flex justify-between text-[13px]">
              <span className="text-[#5f675f]">{active.daysCheckedIn} of {active.durationDays} days</span>
              <span className="font-bold">{progressPct}% complete · {Math.max(0, active.durationDays - active.daysCheckedIn)} days left</span>
            </div>
            <div className="h-3 rounded-full bg-black/8">
              <div className="h-3 rounded-full bg-[#173c2b]" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="mt-4 rounded-md bg-[#eef5f2] p-3">
              <p className="text-[13px] font-semibold">Retention signal</p>
              <p className="mt-1 text-[12px] leading-5 text-[#5f675f]">
                {canCheckIn ? "Today is not checked in yet. This is the highest-friction habit moment." : "Today is complete. The next product job is keeping tomorrow visible."}
              </p>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {Array.from({ length: active.durationDays }, (_, index) => (
                <div key={index} className={`grid h-12 place-items-center rounded-md text-[12px] font-bold ${index < active.daysCheckedIn ? "bg-[#173c2b] text-white" : "bg-[#eef5f2] text-[#5f675f]"}`}>
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="mb-4 text-[22px] font-semibold">Past challenges</h2>
          <div className="space-y-3">
            {pastRows.map(({ title, status, progress, updated }) => {
              const Icon = status === "COMPLETED" ? CheckCircle : XCircle;
              return (
                <div key={title} className="flex items-center justify-between rounded-md border border-black/8 bg-[#f8f8f3] p-3">
                  <div>
                    <p className="text-[13px] font-semibold">{title}</p>
                    <p className="mt-1 text-[11px] text-[#5f675f]">{status} · {progress} · {updated}</p>
                  </div>
                  <Icon size={18} weight="duotone" className={status === "COMPLETED" ? "text-[#173c2b]" : "text-[#b7791f]"} />
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <Panel className="mt-5 p-5">
        <h2 className="mb-4 text-[22px] font-semibold">Presets</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {presets.map((preset) => (
            <div key={preset.id} className="rounded-md border border-black/8 bg-[#f8f8f3] p-4">
              <Flag size={20} weight="duotone" className="text-[#173c2b]" />
              <p className="mt-4 text-[15px] font-semibold">{preset.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-[#5f675f]">{preset.category} · {preset.durationDays} days</p>
              <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[#5f675f]">{preset.description}</p>
              <button onClick={() => handleStart(preset)} disabled={busy} className="mt-4 rounded-md border border-black/10 bg-white px-3 py-2 text-[12px] font-bold disabled:opacity-60">Start</button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
