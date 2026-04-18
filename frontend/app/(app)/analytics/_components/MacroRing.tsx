"use client";

import { motion } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MACROS = [
  { label: "Protein", grams: 94,  pct: 32, color: "#5E8A69", stroke: "#7FA687" },
  { label: "Carbs",   grams: 168, pct: 46, color: "#1F3B2D", stroke: "#2A5240" },
  { label: "Fat",     grams: 52,  pct: 22, color: "#9BA89A", stroke: "#B0BDB0" },
];

const R = 56;
const CIRC = 2 * Math.PI * R;

function buildArcs() {
  let offset = 0;
  return MACROS.map((m) => {
    const dash = (m.pct / 100) * CIRC;
    const gap = CIRC - dash;
    const rotate = (offset / 100) * 360 - 90;
    offset += m.pct;
    return { ...m, dash, gap, rotate };
  });
}

export function MacroRing() {
  const arcs = buildArcs();

  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_4px_20px_rgba(31,59,45,0.05)] backdrop-blur-sm">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        Average daily
      </p>
      <h3 className="mb-5 font-display text-[20px] font-bold text-ink">Macro split</h3>

      <div className="flex items-center gap-6">
        {/* SVG donut */}
        <div className="relative shrink-0">
          <svg width={136} height={136} viewBox="0 0 136 136">
            {/* Track */}
            <circle cx={68} cy={68} r={R} fill="none" stroke="rgba(18,20,16,0.05)" strokeWidth={14} />
            {arcs.map((arc, i) => (
              <motion.circle
                key={arc.label}
                cx={68}
                cy={68}
                r={R}
                fill="none"
                stroke={arc.stroke}
                strokeWidth={14}
                strokeLinecap="round"
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                transform={`rotate(${arc.rotate} 68 68)`}
                initial={{ strokeDasharray: `0 ${CIRC}` }}
                animate={{ strokeDasharray: `${arc.dash} ${arc.gap}` }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.15 }}
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[22px] font-bold leading-none text-ink">314</span>
            <span className="text-[10px] text-ink-muted">g / day</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {MACROS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.stroke }} />
              <div>
                <p className="text-[13px] font-semibold text-ink">{m.grams}g</p>
                <p className="text-[10px] text-ink-muted">{m.label} · {m.pct}%</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
