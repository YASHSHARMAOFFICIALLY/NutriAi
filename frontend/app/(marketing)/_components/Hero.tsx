import { Check, Flame } from "@phosphor-icons/react/dist/ssr";
import { Container } from "../_primitives/Container";
import { Button } from "../_primitives/Button";
import { Reveal, RevealGroup } from "../_primitives/Reveal";
import { MovingGrid } from "../_primitives/MovingGrid";

function PhoneContent() {
  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden p-4 pt-9">
      {/* App header */}
      <div className="flex items-center justify-between">
        <span className="font-display text-[13px] font-bold text-white">NutriAI</span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-sage">· Coach Ria</span>
      </div>

      {/* User chat bubble */}
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-forest px-3 py-2 text-[11px] leading-snug text-cream shadow-sm">
        What&rsquo;s my protein left today?
      </div>

      {/* ANALYZING badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage/20 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-sage-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
          Analyzing
        </span>
      </div>

      {/* Meal image placeholder */}
      <div
        className="relative flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#2A4A38] to-[#1A3028]"
        style={{ height: "72px" }}
      >
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-1.5">
          <span className="text-[9px] text-white/70">Grain bowl · salmon</span>
          <span className="text-[9px] text-sage">540 kcal</span>
        </div>
      </div>

      {/* Coach Ria reply */}
      <div className="mr-auto max-w-[88%] rounded-2xl rounded-tl-sm border border-white/20 bg-white/90 px-3 py-2 text-[11px] leading-snug text-ink shadow-sm">
        You&rsquo;ve hit 82g — 46g to go. A 5oz salmon fillet closes it.
      </div>

      {/* Macro stats */}
      <div className="mt-auto grid grid-cols-4 gap-1.5">
        {[
          { label: "Protein", value: "82g", color: "text-sage-600" },
          { label: "Carbs", value: "140g", color: "text-forest" },
          { label: "Fat", value: "38g", color: "text-ink-muted" },
          { label: "Fiber", value: "12g", color: "text-sage" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-white/10 px-1.5 py-2 text-center">
            <p className={`text-[11px] font-bold ${m.color}`}>{m.value}</p>
            <p className="mt-0.5 text-[8px] text-white/50">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
      <MovingGrid className="-z-10" opacity={0.35} speed={28} cell={32} />
      <div className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[520px] bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(127,166,135,0.22),transparent_70%)]" />

      <Container>
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2 md:gap-10 lg:gap-20">

          {/* ── LEFT: copy ── */}
          <RevealGroup trigger="onLoad" className="flex flex-col gap-7">

            <Reveal as="span" className="inline-flex items-center gap-2 self-start rounded-full border border-sage/30 bg-white/60 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-forest backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              AI Nutrition, Ready for Production
            </Reveal>

            <Reveal as="h1" className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.025em] text-ink md:text-6xl lg:text-[72px]">
              Eat with <span className="italic text-forest">clarity.</span>
              <br />
              Ship with <span className="italic text-forest">confidence.</span>
            </Reveal>

            <Reveal as="p" className="max-w-[480px] text-[17px] leading-[1.5] text-ink-muted">
              NutriAI returns macros, AI coaching, and a developer API — in one snap.
            </Reveal>

            <Reveal className="flex flex-wrap items-center gap-3">
              <Button href="#get-started" size="lg">
                Start free
              </Button>
              <Button href="#developers" variant="ghost" size="lg">
                Read the docs
              </Button>
            </Reveal>

            <Reveal className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-muted">
              {["No credit card", "Free forever tier", "SOC 2 ready"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={12} weight="bold" className="text-sage-600" />
                  {t}
                </span>
              ))}
            </Reveal>

          </RevealGroup>

          {/* ── RIGHT: phone mockup ── */}
          <Reveal trigger="onLoad" delay={0.35} className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-[280px] md:max-w-[320px]">

              {/* Floating streak card */}
              <div className="absolute -left-12 top-16 hidden w-28 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_14px_40px_rgba(31,59,45,0.10)] backdrop-blur-xl md:block">
                <div className="flex items-center gap-1.5">
                  <Flame size={13} weight="fill" className="text-forest" />
                  <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-sage-600">Streak</span>
                </div>
                <p className="mt-1 font-display text-2xl font-bold leading-none text-ink">12</p>
                <p className="mt-0.5 text-[8px] text-ink-muted">days in a row</p>
              </div>

              {/* Phone frame */}
              <div className="relative aspect-[9/19.5] overflow-hidden rounded-[44px] border-[10px] border-ink bg-[#0F1E18] shadow-[0_40px_90px_rgba(31,59,45,0.28)]">
                {/* Dynamic island */}
                <div className="absolute left-1/2 top-0 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-ink" />
                {/* Status bar */}
                <div className="absolute left-4 right-4 top-1 flex items-center justify-between">
                  <span className="text-[9px] text-white/40">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-3 rounded-sm bg-white/30" />
                    <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    <div className="h-2 w-4 rounded-sm bg-white/30" />
                  </div>
                </div>
                <PhoneContent />
              </div>

              {/* Floating macro summary card */}
              <div className="absolute -right-14 bottom-20 hidden w-36 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_14px_40px_rgba(31,59,45,0.10)] backdrop-blur-xl md:block">
                <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.15em] text-ink-muted">Today&rsquo;s Macros</p>
                {[
                  { label: "Protein", pct: 0.58, color: "bg-sage-600" },
                  { label: "Carbs", pct: 0.72, color: "bg-forest" },
                  { label: "Fat", pct: 0.44, color: "bg-sage" },
                ].map((m) => (
                  <div key={m.label} className="mb-1.5 last:mb-0">
                    <div className="mb-0.5 text-[9px] text-ink-muted">{m.label}</div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(18,20,16,0.08)]">
                      <div
                        className={`h-full rounded-full ${m.color}`}
                        style={{ width: `${m.pct * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </Reveal>

        </div>
      </Container>
    </section>
  );
}
