"use client";

import { useEffect, useMemo, useState } from "react";
import { createWeight, deleteWeight, listWeight, type WeightEntry } from "@/lib/api/weight";
import { getProfile } from "@/lib/api/profile";
import { PageHeader, Panel, Stat } from "../_components/ui";

type WeightRow = { id: string; date: string; weightKg: number; note: string };

function rowFromApi(entry: WeightEntry): WeightRow {
  return {
    id: entry.id,
    date: new Date(entry.recordedAt).toLocaleDateString([], { month: "short", day: "2-digit" }),
    weightKg: entry.weightKg,
    note: entry.note ?? "Logged weight",
  };
}

export default function WeightPage() {
  const [entries, setEntries] = useState<WeightRow[]>([]);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [source, setSource] = useState<"loading" | "live" | "error">("loading");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listWeight({ limit: 90 }),
      getProfile().catch(() => null),
    ])
      .then(([res, apiProfile]) => {
        if (cancelled) return;
        if (res.entries.length) {
          const rows = res.entries.map(rowFromApi);
          setEntries(rows);
          setWeight(rows[0].weightKg.toFixed(1));
          setNote(rows[0].note);
        }
        if (apiProfile?.targetWeightKg) setTargetWeight(apiProfile.targetWeightKg);
        setSource("live");
      })
      .catch(() => setSource("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const latest = entries[0];
  const first = entries[entries.length - 1];
  const delta = latest && first ? latest.weightKg - first.weightKg : 0;
  const targetDelta = latest && targetWeight != null ? latest.weightKg - targetWeight : 0;
  const trendLabel = delta < 0 ? "down" : delta > 0 ? "up" : "flat";
  const chart = useMemo(() => entries.slice(0, 7).reverse(), [entries]);

  async function handleSave() {
    const value = Number(weight);
    if (!Number.isFinite(value) || value <= 0) return;
    setSaving(true);
    try {
      const entry = await createWeight({ weightKg: value, note });
      setEntries((current) => [rowFromApi(entry), ...current.filter((row) => row.id !== entry.id)]);
      setSource("live");
    } catch {
      setSource("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const previous = entries;
    setEntries((current) => current.filter((entry) => entry.id !== id));
    try {
      await deleteWeight(id);
      setSource("live");
    } catch {
      setEntries(previous);
      setSource("error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Weight" title="Trend and entries" />
      {source === "error" ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[#b7791f]">Could not load weight data. Sign in and try again.</p>
        </Panel>
      ) : null}

      <section className="mb-5 grid gap-3 md:grid-cols-4">
        <Stat label="Current" value={latest ? `${latest.weightKg.toFixed(1)} kg` : "-"} sub={latest ? `${latest.date} · ${source}` : "No entries yet"} />
        <Stat label="Starting" value={first ? `${first.weightKg.toFixed(1)} kg` : "-"} sub={first?.date ?? "No entries yet"} />
        <Stat label="Target" value={targetWeight != null ? `${targetWeight.toFixed(1)} kg` : "-"} sub={targetWeight != null && latest ? `${Math.abs(targetDelta).toFixed(1)} kg ${targetDelta > 0 ? "above" : "below"} target` : "Set in profile"} />
        <Stat label="Trend" value={`${delta.toFixed(1)} kg`} sub={`${trendLabel} across current range`} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Panel className="p-5">
          <h2 className="text-[22px] font-semibold">Log weight</h2>
          <label className="mt-5 block">
            <span className="text-[12px] font-semibold text-[#5f675f]">Weight</span>
            <div className="mt-2 flex items-end rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3">
              <input className="w-full bg-transparent text-[38px] font-semibold outline-none" value={weight} onChange={(event) => setWeight(event.target.value)} />
              <span className="pb-2 text-[14px] font-bold text-[#5f675f]">kg</span>
            </div>
          </label>
          <label className="mt-4 block">
            <span className="text-[12px] font-semibold text-[#5f675f]">Note</span>
            <input className="mt-2 w-full rounded-md border border-black/10 bg-white px-4 py-3 text-[14px] outline-none" value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button onClick={handleSave} disabled={saving} className="mt-4 w-full rounded-md bg-[#173c2b] py-3 text-[14px] font-bold text-white disabled:opacity-60">{saving ? "Saving..." : "Save entry"}</button>
        </Panel>

        <Panel className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[22px] font-semibold">90 day trend</h2>
            <span className="text-[12px] font-bold text-[#5f675f]">kg</span>
          </div>
          <div className="mb-4 rounded-md bg-[#eef5f2] p-3">
            <p className="text-[13px] font-semibold">Target line: {targetWeight != null ? `${targetWeight.toFixed(1)} kg` : "not set"}</p>
            <p className="mt-1 text-[12px] text-[#5f675f]">
              {targetWeight == null || !latest ? "Set a target and log entries to see trend guidance." : targetDelta > 0 ? "Weight is still above target. Keep the weekly trend moving down." : "Current weight is at or below target. Focus on maintenance consistency."}
            </p>
          </div>
          <div className="flex h-[320px] items-end gap-3 rounded-lg bg-[#f8f8f3] p-4">
            {chart.map((entry) => (
              <div key={entry.id} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-[#173c2b]" style={{ height: `${Math.max(12, (entry.weightKg / Math.max(1, (latest?.weightKg ?? entry.weightKg) + 3)) * 100)}%` }} />
                <span className="text-[10px] font-bold text-[#5f675f]">{entry.weightKg.toFixed(1)}</span>
              </div>
            ))}
            {!chart.length ? <p className="self-center text-[13px] font-semibold text-[#5f675f]">No weight entries yet.</p> : null}
          </div>
        </Panel>
      </section>

      <Panel className="mt-5 overflow-hidden">
        <div className="border-b border-black/10 p-5">
          <h2 className="text-[22px] font-semibold">History</h2>
        </div>
        <div className="divide-y divide-black/8">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-[15px] font-semibold">{entry.weightKg.toFixed(1)} kg</p>
                <p className="mt-1 text-[12px] text-[#5f675f]">{entry.note}</p>
              </div>
              <div className="text-right">
                <span className="block text-[13px] font-bold text-[#5f675f]">{entry.date}</span>
                <button onClick={() => handleDelete(entry.id)} className="mt-2 text-[11px] font-bold text-[#b7791f]">Delete</button>
              </div>
            </div>
          ))}
          {!entries.length ? <div className="p-5 text-[13px] font-semibold text-[#5f675f]">No weight entries yet.</div> : null}
        </div>
      </Panel>
    </div>
  );
}
