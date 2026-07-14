"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle, Flag, MinusCircle, Plus, X } from "@phosphor-icons/react/dist/ssr";
import { ApiError } from "@/lib/api/client";
import { abandonChallenge, checkInToday, startChallenge } from "@/lib/api/challenges";
import type { UserChallengeDTO } from "@/lib/api/types";
import { useActiveChallenges, useAllChallenges, useChallengePresets, useResource } from "@/lib/hooks/swr";
import { PageHeader, Panel, Skeleton, SourceBadge } from "../_components/ui";

type ActiveChallenge = {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  daysCheckedIn: number;
  checkedInToday: boolean;
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
    checkedInToday: item.checkedInToday ?? false,
    status: item.status,
    category: item.challenge?.category ?? "HABIT",
  };
}

export default function ChallengesPage() {
  const activeResult = useActiveChallenges();
  const allResult = useAllChallenges();
  const presetsResult = useChallengePresets();
  const { mutate: mutateActive } = activeResult;
  const { mutate: mutateAll } = allResult;

  const activeRes = useResource(activeResult);
  const allRes = useResource(allResult);
  const presetsRes = useResource(presetsResult);
  // The active/all hooks swallow errors to []; presets surfaces them — so any of
  // the three reporting "error" should reveal the error panel + retry.
  const source: "loading" | "live" | "error" =
    activeRes.source === "error" || allRes.source === "error" || presetsRes.source === "error"
      ? "error"
      : activeRes.source === "loading" || allRes.source === "loading" || presetsRes.source === "loading"
        ? "loading"
        : "live";
  function retryAll() {
    activeRes.retry();
    allRes.retry();
    presetsRes.retry();
  }

  const active = activeResult.data?.[0] ? fromUserChallenge(activeResult.data[0]) : null;
  const past = (allResult.data ?? []).filter((r) => r.status !== "ACTIVE");
  const presets = presetsResult.data ?? [];

  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customDurationDays, setCustomDurationDays] = useState(14);
  const [formError, setFormError] = useState<string | null>(null);

  const canCheckIn = Boolean(active && !active.checkedInToday);
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
      await checkInToday(active.id);
      await Promise.all([mutateActive(), mutateAll()]);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Could not check in today.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStart(preset: typeof presets[number]) {
    setBusy(true);
    try {
      await startChallenge({
        challengeId: preset.id,
        title: preset.title,
        description: preset.description,
        durationDays: preset.durationDays,
      });
      await Promise.all([mutateActive(), mutateAll()]);
      setFormError(null);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Could not start this challenge.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateCustom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active) {
      setFormError("Finish or abandon the current challenge before creating a new one.");
      return;
    }

    const title = customTitle.trim();
    const description = customDescription.trim();
    if (!title) {
      setFormError("Challenge title is required.");
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      await startChallenge({
        title,
        description: description || null,
        durationDays: customDurationDays,
      });
      await Promise.all([mutateActive(), mutateAll()]);
      setCustomTitle("");
      setCustomDescription("");
      setCustomDurationDays(14);
      setCreateOpen(false);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Could not create this challenge.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAbandon() {
    if (!active) return;
    if (!window.confirm("Abandon this challenge? Your progress will be ended.")) return;
    setBusy(true);
    try {
      await abandonChallenge(active.id);
      await Promise.all([mutateActive(), mutateAll()]);
    } catch {
      setFormError("Could not abandon the challenge.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Challenges" title="Active habit check-in" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-[#5f675f]">
          {active ? "One active challenge is already running." : "Start from a preset or create a custom habit challenge."}
        </p>
        <button
          onClick={() => {
            setCreateOpen((current) => !current);
            setFormError(null);
          }}
          disabled={busy || Boolean(active)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173c2b] px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#1f4d38] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createOpen ? <X size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
          {createOpen ? "Close" : "Create challenge"}
        </button>
      </div>
      {source === "error" ? (
        <Panel className="mb-5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-semibold text-[var(--danger)]">Could not load challenge data. Check your connection and try again.</p>
            <button
              onClick={retryAll}
              className="min-h-10 shrink-0 rounded-lg bg-[#173c2b] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#1f4d38]"
            >
              Retry
            </button>
          </div>
        </Panel>
      ) : null}
      {formError ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[var(--danger)]">{formError}</p>
        </Panel>
      ) : null}
      {createOpen ? (
        <Panel className="mb-5 p-5">
          <form onSubmit={handleCreateCustom} className="grid gap-4 lg:grid-cols-[1fr_1.2fr_140px_auto] lg:items-end">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f675f]">Title</span>
              <input
                value={customTitle}
                onChange={(event) => setCustomTitle(event.target.value)}
                maxLength={120}
                placeholder="No sugar after dinner"
                className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-3 text-[13px] font-semibold outline-none focus:border-[#0f8b8d]"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f675f]">Description</span>
              <input
                value={customDescription}
                onChange={(event) => setCustomDescription(event.target.value)}
                maxLength={500}
                placeholder="Keep evenings consistent for two weeks"
                className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-3 text-[13px] font-semibold outline-none focus:border-[#0f8b8d]"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f675f]">Days</span>
              <input
                type="number"
                min={1}
                max={365}
                value={customDurationDays}
                onChange={(event) => setCustomDurationDays(Math.min(365, Math.max(1, Number(event.target.value) || 1)))}
                className="mt-2 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-3 text-[13px] font-semibold outline-none focus:border-[#0f8b8d]"
              />
            </label>
            <button
              type="submit"
              disabled={busy || Boolean(active)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#d7ff68] px-5 py-3 text-[13px] font-bold text-[#101510] transition-colors hover:bg-[#c8f050] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={15} weight="bold" />
              Create
            </button>
          </form>
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
                </div>
                {source === "loading" ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-72 bg-white/10" />
                    <Skeleton className="h-4 w-96 bg-white/10" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-[36px] font-semibold leading-tight">{active?.title ?? "No active challenge"}</h2>
                    <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/72">{active?.description || "Choose a preset below to start a focused habit."}</p>
                  </>
                )}
              </div>
              <button
                onClick={handleCheckIn}
                disabled={!active || !canCheckIn || busy || source === "loading"}
                className={`flex items-center justify-center gap-2 rounded-md px-5 py-3 text-[14px] font-bold ${active && canCheckIn ? "bg-[#d7ff68] text-[#101510]" : "bg-white/12 text-white/60"} disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <CheckCircle size={17} weight="fill" />
                {!active ? "Start first" : canCheckIn ? "Check in today" : "Checked in"}
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
              <p className="text-[13px] font-semibold">Today</p>
              <p className="mt-1 text-[12px] leading-5 text-[#5f675f]">
                {!active ? "Pick a preset to begin tracking a habit." : canCheckIn ? "You have not checked in today yet." : "Today is complete. Come back tomorrow to keep the streak moving."}
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
              const Icon = status === "COMPLETED" ? CheckCircle : MinusCircle;
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
          {source === "loading" ? (
            <>
              <Skeleton className="h-44" />
              <Skeleton className="h-44" />
              <Skeleton className="h-44" />
              <Skeleton className="h-44" />
            </>
          ) : presets.map((preset) => (
            <div key={preset.id} className="group/preset rounded-xl border border-border bg-surface-alt p-5 transition-[border-color,background-color,box-shadow] hover:border-teal/20 hover:bg-white hover:shadow-md">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-forest shadow-sm transition-colors group-hover/preset:bg-forest group-hover/preset:text-white">
                <Flag size={20} weight="duotone" />
              </span>
              <p className="mt-4 text-[15px] font-bold text-forest">{preset.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-muted">{preset.category} · {preset.durationDays} days</p>
              <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-muted">{preset.description}</p>
              <button onClick={() => handleStart(preset)} disabled={busy || Boolean(active)} className="mt-4 rounded-xl border border-border bg-white px-4 py-2.5 text-[12px] font-bold text-forest transition-[color,background-color,box-shadow] hover:bg-forest hover:text-white hover:shadow-sm disabled:opacity-60">{active ? "Finish current first" : "Start"}</button>
            </div>
          ))}
          {source !== "loading" && !presets.length ? <p className="text-[13px] font-semibold text-[#5f675f]">No challenge presets are available yet.</p> : null}
        </div>
      </Panel>
    </div>
  );
}
