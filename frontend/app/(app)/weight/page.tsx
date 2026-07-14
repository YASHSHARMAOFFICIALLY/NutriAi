"use client";

import { useMemo, useState } from "react";
import { createWeight, deleteWeight, type WeightEntry } from "@/lib/api/weight";
import { useWeight, useProfile, useResource } from "@/lib/hooks/swr";
import { useToast } from "@/lib/toast";
import { PageHeader, Panel, Skeleton, Stat } from "../_components/ui";

type WeightRow = { id: string; date: string; weightKg: number; note: string };

const MIN_WEIGHT_KG = 20;
const MAX_WEIGHT_KG = 500;
const CHART_ENTRIES = 14;

function rowFromApi(entry: WeightEntry): WeightRow {
  return {
    id: entry.id,
    date: new Date(entry.recordedAt).toLocaleDateString([], { month: "short", day: "2-digit" }),
    weightKg: entry.weightKg,
    note: entry.note ?? "Logged weight",
  };
}

/** Accept comma decimals ("72,5" -> 72.5) and return a finite number or null. */
function parseWeight(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export default function WeightPage() {
  const { toast } = useToast();
  const weightResult = useWeight(90);
  const { data: weightData, mutate: mutateWeight } = weightResult;
  const weightResource = useResource(weightResult);
  const source = weightResource.source;
  const { data: profileData } = useProfile();

  const [weightInput, setWeightInput] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const targetWeight = profileData?.targetWeightKg ?? null;
  const entries = useMemo(() => weightData?.entries.map(rowFromApi) ?? [], [weightData]);

  const latest = entries[0];
  const first = entries[entries.length - 1];

  // Default the fields from the latest entry while the user has not touched them
  // (null === untouched), so no state is written during render.
  const weight = weightInput ?? (latest ? latest.weightKg.toFixed(1) : "");
  const noteValue = note ?? (latest ? latest.note : "");

  const delta = latest && first ? latest.weightKg - first.weightKg : 0;
  const targetDelta = latest && targetWeight != null ? latest.weightKg - targetWeight : 0;
  const trendLabel = delta < 0 ? "down" : delta > 0 ? "up" : "flat";

  // Most recent N entries, oldest -> newest left-to-right.
  const chart = useMemo(() => entries.slice(0, CHART_ENTRIES).reverse(), [entries]);
  // Normalize bars to the visible series min/max with padding so trends are visible.
  const chartScale = useMemo(() => {
    if (!chart.length) return { min: 0, span: 1 };
    const values = chart.map((entry) => entry.weightKg);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(0.5, (max - min) * 0.15);
    const lo = min - pad;
    const hi = max + pad;
    return { min: lo, span: Math.max(0.1, hi - lo) };
  }, [chart]);

  async function handleSave() {
    const value = parseWeight(weight);
    if (value === null) {
      setFieldError("Enter a weight in kilograms.");
      return;
    }
    if (value < MIN_WEIGHT_KG || value > MAX_WEIGHT_KG) {
      setFieldError(`Weight must be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.`);
      return;
    }
    setFieldError("");
    setSaving(true);
    try {
      const entry = await createWeight({ weightKg: value, note: noteValue });
      await mutateWeight(
        weightData ? { ...weightData, entries: [entry, ...weightData.entries.filter((e) => e.id !== entry.id)] } : undefined,
        { revalidate: true },
      );
      toast("success", "Weight entry saved.");
    } catch {
      toast("error", "Could not save this entry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!weightData) return;
    if (!window.confirm("Delete this weight entry?")) return;
    const previous = weightData;
    const optimistic = { ...weightData, entries: weightData.entries.filter((e) => e.id !== id) };
    try {
      await mutateWeight(optimistic, { revalidate: false });
      await deleteWeight(id);
      toast("success", "Weight entry deleted.");
      await mutateWeight();
    } catch {
      await mutateWeight(previous, { revalidate: false });
      toast("error", "Could not delete this entry.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Weight" title="Trend and entries" />
      {source === "error" ? (
        <Panel className="mb-5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-semibold text-[var(--danger)]">Could not load weight data. Check your connection and try again.</p>
            <button
              onClick={weightResource.retry}
              className="min-h-10 shrink-0 rounded-lg bg-[#173c2b] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#1f4d38]"
            >
              Retry
            </button>
          </div>
        </Panel>
      ) : null}

      {source === "loading" ? (
        <section className="mb-5 grid gap-3 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </section>
      ) : (
        <section className="mb-5 grid gap-3 md:grid-cols-4">
          <Stat label="Current" value={latest ? `${latest.weightKg.toFixed(1)} kg` : "-"} sub={latest ? latest.date : "No entries yet"} />
          <Stat label="Starting" value={first ? `${first.weightKg.toFixed(1)} kg` : "-"} sub={first?.date ?? "No entries yet"} />
          <Stat label="Target" value={targetWeight != null ? `${targetWeight.toFixed(1)} kg` : "-"} sub={targetWeight != null && latest ? `${Math.abs(targetDelta).toFixed(1)} kg ${targetDelta > 0 ? "above" : "below"} target` : "Set in profile"} />
          <Stat label="Trend" value={`${delta.toFixed(1)} kg`} sub={`${trendLabel} across current range`} />
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Panel className="p-5">
          <h2 className="text-[22px] font-semibold">Log weight</h2>
          <label className="mt-5 block">
            <span className="text-[12px] font-semibold text-[#5f675f]">Weight</span>
            <div className={`mt-2 flex items-end rounded-md border bg-[#f8f8f3] px-4 py-3 ${fieldError ? "border-[var(--danger)]" : "border-black/10"}`}>
              <input
                inputMode="decimal"
                aria-label="Weight in kilograms"
                aria-invalid={Boolean(fieldError)}
                className="w-full bg-transparent text-[38px] font-semibold outline-none tabular-nums"
                value={weight}
                onChange={(event) => {
                  setWeightInput(event.target.value);
                  if (fieldError) setFieldError("");
                }}
              />
              <span className="pb-2 text-[14px] font-bold text-[#5f675f]">kg</span>
            </div>
          </label>
          {fieldError ? <p className="mt-2 text-[12px] font-semibold text-[var(--danger)]">{fieldError}</p> : null}
          <label className="mt-4 block">
            <span className="text-[12px] font-semibold text-[#5f675f]">Note</span>
            <input className="mt-2 w-full rounded-md border border-black/10 bg-white px-4 py-3 text-[14px] outline-none" value={noteValue} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button onClick={handleSave} disabled={saving} className="mt-4 w-full rounded-md bg-[#173c2b] py-3 text-[14px] font-bold text-white disabled:opacity-60">{saving ? "Saving..." : "Save entry"}</button>
        </Panel>

        <Panel className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[22px] font-semibold">Recent trend (last {chart.length} entries)</h2>
            <span className="text-[12px] font-bold text-[#5f675f]">kg</span>
          </div>
          <div className="mb-4 rounded-md bg-[#eef5f2] p-3">
            <p className="text-[13px] font-semibold">Target line: {targetWeight != null ? `${targetWeight.toFixed(1)} kg` : "not set"}</p>
            <p className="mt-1 text-[12px] text-[#5f675f]">
              {targetWeight == null || !latest ? "Set a target and log entries to see trend guidance." : targetDelta > 0 ? "Weight is still above target. Keep the weekly trend moving down." : "Current weight is at or below target. Focus on maintenance consistency."}
            </p>
          </div>
          <div className="flex h-[320px] items-end gap-3 rounded-lg bg-[#f8f8f3] p-4">
            {source === "loading" ? (
              <div className="grid w-full gap-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : chart.map((entry) => (
              <div key={entry.id} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-[#173c2b]" style={{ height: `${Math.round(12 + ((entry.weightKg - chartScale.min) / chartScale.span) * 88)}%` }} />
                <span className="text-[10px] font-bold text-[#5f675f] tabular-nums">{entry.weightKg.toFixed(1)}</span>
              </div>
            ))}
            {source !== "loading" && !chart.length ? <p className="self-center text-[13px] font-semibold text-[#5f675f]">No weight entries yet.</p> : null}
          </div>
        </Panel>
      </section>

      <Panel className="mt-5 overflow-hidden">
        <div className="border-b border-black/10 p-5">
          <h2 className="text-[22px] font-semibold">History</h2>
        </div>
        <div className="divide-y divide-black/8">
          {source === "loading" ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-[15px] font-semibold tabular-nums">{entry.weightKg.toFixed(1)} kg</p>
                <p className="mt-1 text-[12px] text-[#5f675f]">{entry.note}</p>
              </div>
              <div className="text-right">
                <span className="block text-[13px] font-bold text-[#5f675f]">{entry.date}</span>
                <button onClick={() => handleDelete(entry.id)} className="mt-2 min-h-9 text-[11px] font-bold text-[#b7791f]">Delete</button>
              </div>
            </div>
          ))}
          {source !== "loading" && !entries.length ? (
            <div className="p-5">
              <div className="rounded-lg border border-dashed border-black/10 bg-[#f8f8f3] p-5 text-center">
                <p className="text-[15px] font-bold text-[#173c2b]">No weight entries yet</p>
                <p className="mt-2 text-[13px] text-[#5f675f]">Add your first entry to start trend tracking.</p>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
