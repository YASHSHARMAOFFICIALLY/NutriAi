"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Barbell, Trash, TrendDown, TrendUp } from "@phosphor-icons/react/dist/ssr";
import {
  createWeight,
  deleteWeight,
  listWeight,
  kgToLb,
  lbToKg,
  type WeightEntry,
  type WeightListResponse,
} from "@/lib/api/weight";
import { ApiError } from "@/lib/api/client";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const RANGES = [
  { key: "30", label: "30d", days: 30 },
  { key: "90", label: "90d", days: 90 },
  { key: "365", label: "1y", days: 365 },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];
type Unit = "kg" | "lb";

const isoAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const fmtWeight = (kg: number, unit: Unit) =>
  unit === "kg" ? `${kg.toFixed(1)} kg` : `${kgToLb(kg).toFixed(1)} lb`;

const fmtDelta = (kg: number, unit: Unit) => {
  const v = unit === "kg" ? kg : kgToLb(kg);
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)} ${unit}`;
};

export default function WeightPage() {
  const [unit, setUnit] = useState<Unit>("kg");
  const [range, setRange] = useState<RangeKey>("90");
  const [data, setData] = useState<WeightListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (days: number) => {
    setLoading(true);
    try {
      const res = await listWeight({ from: isoAgo(days) });
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load weight history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const days = RANGES.find((r) => r.key === range)?.days ?? 90;
    load(days);
  }, [range, load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number.parseFloat(form);
    if (!Number.isFinite(val) || val <= 0) {
      setError("Enter a valid weight");
      return;
    }
    const kg = unit === "kg" ? val : lbToKg(val);
    if (kg < 20 || kg > 500) {
      setError(`Weight must be between ${unit === "kg" ? "20–500 kg" : "44–1100 lb"}`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await createWeight({ weightKg: Number(kg.toFixed(2)), note: note.trim() || null });
      setForm("");
      setNote("");
      const days = RANGES.find((r) => r.key === range)?.days ?? 90;
      await load(days);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteWeight(id);
      const days = RANGES.find((r) => r.key === range)?.days ?? 90;
      await load(days);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete");
    }
  };

  const entries = data?.entries ?? [];
  const latest = data?.latest;
  const first = data?.first;
  const delta = data?.deltaKg ?? 0;
  const trendDown = delta < 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-8 flex items-start justify-between gap-4"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Body
          </p>
          <h1 className="mt-1 font-display text-[32px] font-bold leading-tight text-ink">
            Weight
          </h1>
          <p className="mt-1 text-[14px] text-ink-muted">
            Log once a week, see the trend that matters.
          </p>
        </div>
        <div className="flex rounded-full border border-ink/10 bg-white/60 p-1 text-[12px] font-medium backdrop-blur-sm">
          {(["kg", "lb"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`rounded-full px-3 py-1 transition ${
                unit === u ? "bg-forest text-cream" : "text-ink-muted hover:text-ink"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Headline stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Current"
          value={latest ? fmtWeight(latest.weightKg, unit) : "—"}
          sub={latest ? fmtDate(latest.recordedAt) : "No entries yet"}
        />
        <StatCard
          label="Starting"
          value={first ? fmtWeight(first.weightKg, unit) : "—"}
          sub={first ? fmtDate(first.recordedAt) : "Log your first to set baseline"}
        />
        <StatCard
          label="Change"
          value={first && latest && latest.id !== first.id ? fmtDelta(delta, unit) : "—"}
          sub={
            first && latest && latest.id !== first.id
              ? `over ${Math.max(
                  1,
                  Math.round(
                    (new Date(latest.recordedAt).getTime() - new Date(first.recordedAt).getTime()) /
                      (1000 * 60 * 60 * 24),
                  ),
                )} days`
              : "needs at least 2 entries"
          }
          icon={
            first && latest && latest.id !== first.id ? (
              trendDown ? (
                <TrendDown size={18} weight="bold" className="text-sage" />
              ) : (
                <TrendUp size={18} weight="bold" className="text-forest" />
              )
            ) : null
          }
        />
      </motion.div>

      {/* Quick add */}
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="mb-6 rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <Barbell size={22} weight="regular" className="text-sage shrink-0" />
            <input
              type="number"
              step="0.1"
              value={form}
              onChange={(e) => setForm(e.target.value)}
              placeholder={unit === "kg" ? "72.4" : "159.6"}
              className="w-full bg-transparent text-[20px] font-semibold text-ink placeholder:text-ink-muted/50 focus:outline-none"
            />
            <span className="text-[14px] text-ink-muted">{unit}</span>
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            maxLength={200}
            className="w-full rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-[13px] text-ink placeholder:text-ink-muted/50 focus:border-forest/40 focus:outline-none sm:w-64"
          />
          <button
            type="submit"
            disabled={busy || !form.trim()}
            className="rounded-full bg-forest px-5 py-2.5 text-[13px] font-semibold text-cream shadow-[0_2px_8px_rgba(31,59,45,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Saving…" : "Log weight"}
          </button>
        </div>
        {error ? (
          <p className="mt-3 text-[12px] text-red-700">{error}</p>
        ) : null}
      </motion.form>

      {/* Range selector + chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
        className="mb-6 rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[18px] font-bold text-ink">Trend</h2>
          <div className="flex rounded-full border border-ink/10 bg-white/70 p-1 text-[12px] font-medium">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`rounded-full px-3 py-1 transition ${
                  range === r.key ? "bg-forest text-cream" : "text-ink-muted hover:text-ink"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-48 animate-pulse rounded-xl bg-ink/5" />
        ) : entries.length < 2 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center text-[13px] text-ink-muted">
            <Barbell size={28} className="mb-2 text-ink-muted/40" />
            Log at least two entries to see your trend.
          </div>
        ) : (
          <Chart entries={entries} unit={unit} />
        )}
      </motion.div>

      {/* History list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
        className="rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm"
      >
        <h2 className="mb-4 font-display text-[18px] font-bold text-ink">History</h2>
        {entries.length === 0 ? (
          <p className="text-[13px] text-ink-muted">No entries in this range.</p>
        ) : (
          <ul className="divide-y divide-ink/5">
            <AnimatePresence initial={false}>
              {entries.map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-[15px] font-semibold text-ink">
                      {fmtWeight(e.weightKg, unit)}
                    </p>
                    <p className="text-[12px] text-ink-muted">
                      {fmtDate(e.recordedAt)}
                      {e.note ? ` · ${e.note}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(e.id)}
                    className="rounded-full p-2 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete entry"
                  >
                    <Trash size={16} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-5 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-display text-[26px] font-bold text-ink">{value}</p>
        {icon}
      </div>
      <p className="mt-1 text-[12px] text-ink-muted">{sub}</p>
    </div>
  );
}

function Chart({ entries, unit }: { entries: WeightEntry[]; unit: Unit }) {
  // entries come DESC — sort ASC for the chart.
  const points = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );
    return sorted.map((e) => ({
      t: new Date(e.recordedAt).getTime(),
      v: unit === "kg" ? e.weightKg : kgToLb(e.weightKg),
      iso: e.recordedAt,
    }));
  }, [entries, unit]);

  const W = 640;
  const H = 200;
  const PAD = { l: 38, r: 12, t: 12, b: 24 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const xs = points.map((p) => p.t);
  const ys = points.map((p) => p.v);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMinRaw = Math.min(...ys);
  const yMaxRaw = Math.max(...ys);
  const yPad = Math.max(0.5, (yMaxRaw - yMinRaw) * 0.2);
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;

  const x = (t: number) => PAD.l + ((t - xMin) / Math.max(1, xMax - xMin)) * innerW;
  const y = (v: number) => PAD.t + (1 - (v - yMin) / Math.max(0.001, yMax - yMin)) * innerH;

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(points[points.length - 1].t).toFixed(1)},${(H - PAD.b).toFixed(1)} L${x(points[0].t).toFixed(1)},${(H - PAD.b).toFixed(1)} Z`;

  const yTicks = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div className="-mx-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ minWidth: 320 }}>
        <defs>
          <linearGradient id="weight-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5E8A69" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#5E8A69" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y axis ticks */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#12141014" strokeDasharray="3 4" />
            <text x={PAD.l - 6} y={y(t) + 3} fontSize="10" textAnchor="end" fill="#6b7260">
              {t.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Area + line */}
        <motion.path
          d={area}
          fill="url(#weight-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke="#1F3B2D"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(p.t)} cy={y(p.v)} r={3} fill="#1F3B2D" />
          </g>
        ))}

        {/* First / last X labels */}
        <text x={PAD.l} y={H - 6} fontSize="10" fill="#6b7260">
          {shortDate(points[0].iso)}
        </text>
        <text x={W - PAD.r} y={H - 6} fontSize="10" fill="#6b7260" textAnchor="end">
          {shortDate(points[points.length - 1].iso)}
        </text>
      </svg>
    </div>
  );
}
