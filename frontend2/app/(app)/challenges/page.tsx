"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Flag, XCircle } from "@phosphor-icons/react/dist/ssr";
import { abandonChallenge, checkInToday, listMyChallenge, listPresets, startChallenge } from "@/lib/api/challenges";
import type { ChallengePreset, UserChallengeDTO } from "@/lib/api/types";
import { PageHeader, Panel, SourceBadge } from "../_components/ui";

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
  const [active, setActive] = useState<ActiveChallenge | null>(null);
  const [presets, setPresets] = useState<ChallengePreset[]>([]);
  const [past, setPast] = useState<UserChallengeDTO[]>([]);
  const [source, setSource] = useState<"loading" | "live" | "error">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listMyChallenge("ACTIVE").catch(() => []),
      listMyChallenge().catch(() => []),
      listPresets(),
    ])
      .then(([activeRows, allRows, presetRows]) => {
        if (cancelled) return;
        setActive(activeRows[0] ? fromUserChallenge(activeRows[0]) : null);
        setPast(allRows.filter((row) => row.status !== "ACTIVE"));
        setPresets(presetRows);
        setSource("live");
      })
      .catch(() => setSource("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const canCheckIn = Boolean(active && active.lastCheckInDate !== new Date().toISOString().slice(0, 10));
  const pastRows = past.map((row) => ({
    title: row.title,
    status: row.status,
    progress: `${row.daysCheckedIn}/${row.durationDays}`,
    updated: new Date(row.updatedAt).toLocaleDateString(),
  }));
  const progressPct = active ? Math.min(100, Math.round((active.daysCheckedIn / active.durationDays) * 100)) : 0;

  async function handleCheckIn() {
    setBusy(true);
    try {
      if (!active) return;
      const updated = await checkInToday(active.id);
      setActive(fromUserChallenge(updated));
      setSource("live");
    } catch {
      setSource("error");
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
      setSource("error");
    } finally {
      setBusy(false);
    }
  }

  async function handleAbandon() {
    if (!active) return;
    setBusy(true);
    try {
      const abandoned = await abandonChallenge(active.id);
      setPast((current) => [abandoned, ...current]);
      setActive(null);
      setSource("live");
    } catch {
      setSource("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Challenges" title="Active habit check-in" />
      {source === "error" ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[#b7791f]">Could not load live challenge data. Backend data is required.</p>
        </Panel>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Panel className="overflow-hidden">
          <div className="bg-[#173c2b] p-5 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <SourceBadge label={(active?.category ?? "none").toLowerCase()} />
                  <SourceBadge label={(active?.status ?? "inactive").toLowerCase()} />
                  <SourceBadge label={source} />
                </div>
                <h2 className="text-[36px] font-semibold leading-tight">{active?.title ?? "No active challenge"}</h2>
                <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/72">{active?.description || "Start a preset below to begin a new habit loop."}</p>
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
                disabled={busy || !active}
                className="rounded-md border border-white/20 px-5 py-3 text-[14px] font-bold text-white/78 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Abandon
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="mb-2 flex justify-between text-[13px]">
              <span className="text-[#5f675f]">{active?.daysCheckedIn ?? 0} of {active?.durationDays ?? 0} days</span>
              <span className="font-bold">{progressPct}% complete · {active ? Math.max(0, active.durationDays - active.daysCheckedIn) : 0} days left</span>
            </div>
            <div className="h-3 rounded-full bg-black/8">
              <div className="h-3 rounded-full bg-[#173c2b]" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="mt-4 rounded-md bg-[#eef5f2] p-3">
              <p className="text-[13px] font-semibold">Retention signal</p>
              <p className="mt-1 text-[12px] leading-5 text-[#5f675f]">
                {!active ? "No active challenge is running." : canCheckIn ? "Today is not checked in yet. This is the highest-friction habit moment." : "Today is complete. The next product job is keeping tomorrow visible."}
              </p>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {active ? Array.from({ length: active.durationDays }, (_, index) => (
                <div key={index} className={`grid h-12 place-items-center rounded-md text-[12px] font-bold ${index < active.daysCheckedIn ? "bg-[#173c2b] text-white" : "bg-[#eef5f2] text-[#5f675f]"}`}>
                  {index + 1}
                </div>
              )) : <p className="col-span-7 text-[13px] font-semibold text-[#5f675f]">Start a preset to create a live challenge.</p>}
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
            {!pastRows.length ? <p className="text-[13px] font-semibold text-[#5f675f]">No past challenges yet.</p> : null}
          </div>
        </Panel>
      </section>

      <Panel className="mt-5 p-5">
        <h2 className="mb-4 text-[22px] font-semibold">Presets</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {presets.map((preset) => (
            <div key={preset.id} className="group/preset rounded-xl border border-border bg-surface-alt p-5 transition-all hover:border-teal/20 hover:bg-white hover:shadow-md">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-forest shadow-sm transition-colors group-hover/preset:bg-forest group-hover/preset:text-white">
                <Flag size={20} weight="duotone" />
              </span>
              <p className="mt-4 text-[15px] font-bold text-forest">{preset.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-muted">{preset.category} · {preset.durationDays} days</p>
              <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-muted">{preset.description}</p>
              <button onClick={() => handleStart(preset)} disabled={busy} className="mt-4 rounded-xl border border-border bg-white px-4 py-2.5 text-[12px] font-bold text-forest transition-all hover:bg-forest hover:text-white hover:shadow-sm disabled:opacity-60">Start</button>
            </div>
          ))}
          {!presets.length ? <p className="text-[13px] font-semibold text-[#5f675f]">No challenge presets are available from the backend.</p> : null}
        </div>
      </Panel>
    </div>
  );
}
