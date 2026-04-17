import { Flame } from "@phosphor-icons/react/dist/ssr";
import { Container } from "../_primitives/Container";
import { GlassCard } from "../_primitives/GlassCard";
import { Reveal } from "../_primitives/Reveal";

const DAYS = [
  { d: "Mon", kcal: 1960, pct: 0.93 },
  { d: "Tue", kcal: 2180, pct: 1.04 },
  { d: "Wed", kcal: 1820, pct: 0.87 },
  { d: "Thu", kcal: 2090, pct: 0.99 },
  { d: "Fri", kcal: 2240, pct: 1.07 },
  { d: "Sat", kcal: 1720, pct: 0.82 },
  { d: "Sun", kcal: 2040, pct: 0.97 },
] as const;

// Energy-share donut: 30% protein / 40% carbs / 30% fat (the backend default).
function EnergyDonut() {
  const r = 38;
  const c = 2 * Math.PI * r;
  const segs = [
    { value: 0.3, color: "#5E8A69" },
    { value: 0.4, color: "#7FA687" },
    { value: 0.3, color: "#1F3B2D" },
  ];
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="h-40 w-40">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(127,166,135,0.18)" strokeWidth="10" />
      {segs.map((s, i) => {
        const dash = s.value * c;
        const el = (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${c}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
          />
        );
        offset += dash;
        return el;
      })}
      <text x="50" y="48" textAnchor="middle" className="fill-ink font-display text-[13px] font-bold">
        Energy
      </text>
      <text x="50" y="60" textAnchor="middle" className="fill-ink-muted text-[6px] uppercase tracking-[0.2em]">
        30 / 40 / 30
      </text>
    </svg>
  );
}

export function AnalyticsShowcase() {
  return (
    <section className="relative py-28 md:py-36">
      <Container>
        <div className="mx-auto mb-14 max-w-[680px] text-center">
          <Reveal as="p" className="text-[12px] font-medium uppercase tracking-[0.2em] text-sage-600">
            Analytics
          </Reveal>
          <Reveal as="h2" className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-5xl">
            Progress you can feel in a glance.
          </Reveal>
        </div>

        <Reveal>
          <GlassCard className="grid grid-cols-1 gap-8 p-8 md:grid-cols-[1.6fr_1fr_1fr] md:p-10">
            {/* Daily bars */}
            <div className="flex flex-col">
              <div className="mb-6 flex items-baseline justify-between">
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">Daily calories</h3>
                <span className="text-[12px] text-ink-muted">Last 7 days</span>
              </div>
              <div className="flex flex-1 items-end gap-3">
                {DAYS.map((d) => (
                  <div key={d.d} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-linear-to-t from-sage/40 to-sage-600"
                      style={{ height: `${Math.min(d.pct * 100, 120)}%`, minHeight: "32px" }}
                      aria-label={`${d.d}: ${d.kcal} kcal`}
                    />
                    <span className="text-[11px] font-medium text-ink-muted">{d.d}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[13px] text-ink-muted">
                Avg adherence <span className="font-semibold text-forest">96%</span> of your 2,100 kcal target.
              </p>
            </div>

            {/* Energy share */}
            <div className="flex flex-col items-center justify-center border-t border-white/60 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <EnergyDonut />
              <p className="mt-3 text-center text-[13px] text-ink-muted">
                Protein / Carbs / Fat<br />energy share
              </p>
            </div>

            {/* Streak */}
            <div className="flex flex-col items-start justify-center gap-3 border-t border-white/60 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <div className="flex items-center gap-2 text-forest">
                <Flame size={22} weight="fill" />
                <span className="text-[12px] font-medium uppercase tracking-[0.18em]">Streak</span>
              </div>
              <div className="font-display text-6xl font-bold leading-none tracking-[-0.03em] text-ink">
                12
              </div>
              <p className="text-[13px] text-ink-muted">
                Consecutive days logged · <span className="font-semibold text-forest">8 within target</span>
              </p>
            </div>
          </GlassCard>
        </Reveal>
      </Container>
    </section>
  );
}
