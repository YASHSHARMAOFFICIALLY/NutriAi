import { Camera, Sparkle, Target, ChartLineUp } from "@phosphor-icons/react/dist/ssr";
import { Container } from "../_primitives/Container";
import { GlassCard } from "../_primitives/GlassCard";
import { MovingGrid } from "../_primitives/MovingGrid";
import { Reveal } from "../_primitives/Reveal";

// Mini vignettes — each cell renders its own hand-drawn preview so the
// bento doesn't rely on screenshots. All SVG / CSS, no asset files.

function SnapVignette() {
  return (
    <div className="relative flex h-44 items-center justify-center">
      <div className="absolute left-6 top-4 h-28 w-40 rotate-[-4deg] rounded-xl bg-linear-to-br from-[#EAF0E6] to-[#D9E4DC] shadow-[0_10px_24px_rgba(31,59,45,0.12)]" />
      <div className="absolute right-6 top-8 w-44 rounded-xl border border-white/70 bg-white/80 p-3 backdrop-blur-sm shadow-[0_14px_30px_rgba(31,59,45,0.10)]">
        <div className="mb-2 h-2 w-16 rounded-full bg-sage/50" />
        <div className="flex items-center justify-between text-[11px] font-semibold text-ink">
          <span>540 kcal</span>
          <span className="text-sage-600">· 38P / 42C / 22F</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="h-1 rounded-full bg-sage" />
          <div className="h-1 rounded-full bg-sage/70" />
          <div className="h-1 rounded-full bg-forest/80" />
        </div>
      </div>
    </div>
  );
}

function ChatVignette() {
  return (
    <div className="flex h-44 flex-col justify-end gap-2 pr-2">
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-forest px-3 py-2 text-[12px] text-cream shadow-sm">
        How much protein is left today?
      </div>
      <div className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm border border-white/70 bg-white/80 px-3 py-2 text-[12px] text-ink shadow-sm">
        You&rsquo;re 42g short of your 140g target — try a 6oz chicken breast (≈54g) to close it.
      </div>
    </div>
  );
}

function TargetsVignette() {
  const pct = 0.62;
  const c = 2 * Math.PI * 42;
  return (
    <div className="flex h-44 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-36 w-36">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(127,166,135,0.25)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#5E8A69"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="48" textAnchor="middle" className="fill-ink font-display text-[16px] font-bold">
          1,860
        </text>
        <text x="50" y="62" textAnchor="middle" className="fill-ink-muted text-[7px] uppercase tracking-[0.2em]">
          of 3,000 kcal
        </text>
      </svg>
    </div>
  );
}

function AnalyticsVignette() {
  const bars = [42, 68, 55, 78, 62, 85, 71];
  return (
    <div className="flex h-44 flex-col justify-end gap-3">
      <div className="flex items-end gap-2">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-linear-to-t from-sage/40 to-sage"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] text-ink-muted">
        <span>Last 7 days</span>
        <span className="font-semibold text-forest">🔥 12-day streak</span>
      </div>
    </div>
  );
}

type Cell = {
  icon: React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "duotone"; className?: string }>;
  title: string;
  copy: string;
  vignette: React.ReactNode;
  span: string;
};

const CELLS: Cell[] = [
  {
    icon: Camera,
    title: "Snap → analyze",
    copy: "Upload a photo or type what you ate. NutriAI returns calories, macros, and a confidence score in seconds — backed by a vision model behind a swappable provider.",
    vignette: <SnapVignette />,
    span: "md:col-span-2",
  },
  {
    icon: Sparkle,
    title: "AI chat assistant",
    copy: "Ask follow-ups about your day. The assistant remembers your meals, targets, and streak.",
    vignette: <ChatVignette />,
    span: "md:col-span-1",
  },
  {
    icon: Target,
    title: "Personalized targets",
    copy: "BMR, TDEE, and macro targets computed via Mifflin-St Jeor from your profile. Override anything — the engine adapts.",
    vignette: <TargetsVignette />,
    span: "md:col-span-1",
  },
  {
    icon: ChartLineUp,
    title: "Streaks & analytics",
    copy: "Daily totals, macro energy share, target adherence, and both logging + calorie-target streaks — all in one view.",
    vignette: <AnalyticsVignette />,
    span: "md:col-span-2",
  },
];

export function FeatureBento() {
  return (
    <section id="features" className="relative py-28 md:py-36">
      <Container>
        <div className="mx-auto mb-14 max-w-[680px] text-center">
          <Reveal as="p" className="text-[12px] font-medium uppercase tracking-[0.2em] text-sage-600">
            Features
          </Reveal>
          <Reveal as="h2" className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-5xl">
            Everything you need to eat with intent.
          </Reveal>
          <Reveal as="p" className="mt-4 text-[17px] leading-[1.5] text-ink-muted">
            Four capabilities that replace the spreadsheet, the calorie book, and the guilt.
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {CELLS.map((cell) => {
            const Icon = cell.icon;
            return (
              <Reveal key={cell.title} className={cell.span}>
                <GlassCard className="group relative h-full">
                  <MovingGrid className="-z-0" opacity={0.22} cell={22} speed={40} />
                  <div className="relative z-10 flex h-full flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/80 text-forest shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(31,59,45,0.08)]">
                        <Icon size={20} weight="duotone" />
                      </div>
                      <h3 className="font-display text-xl font-bold tracking-[-0.01em] text-ink">
                        {cell.title}
                      </h3>
                    </div>
                    <p className="text-[15px] leading-[1.5] text-ink-muted">{cell.copy}</p>
                    <div className="mt-auto">{cell.vignette}</div>
                  </div>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
