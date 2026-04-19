import type { ReactNode } from "react";
import {
  Camera,
  ChartBar,
  Check,
  Flame,
  Lightning,
  Sparkle,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { Container } from "../_primitives/Container";
import { Button } from "../_primitives/Button";
import { Reveal, RevealGroup } from "../_primitives/Reveal";
import { DisplayCards, type CardData } from "../_primitives/DisplayCards";
import { MovingGrid } from "../_primitives/MovingGrid";

const TRACKING_CARDS: CardData[] = [
  {
    icon: <Flame size={14} weight="fill" className="text-orange-400" />,
    title: "Streak",
    description: "12 days in a row and still climbing.",
    meta: "Best run this month",
    titleColor: "text-orange-400",
  },
  {
    icon: <Lightning size={14} weight="fill" className="text-yellow-400" />,
    title: "Calories",
    description: "1,462 of 2,150 kcal logged today.",
    meta: "Tracked with Snap",
    titleColor: "text-yellow-400",
  },
  {
    icon: <Star size={14} weight="fill" className="text-sky-400" />,
    title: "Protein",
    description: "82g logged, 46g left to target.",
    meta: "Goal: 128g / day",
    titleColor: "text-sky-400",
  },
];

const AI_CARDS: CardData[] = [
  {
    icon: <Sparkle size={14} weight="fill" className="text-sage" />,
    title: "Coach Ria",
    description: "Salmon tonight closes most of your protein gap.",
    meta: "AI Nutritionist · just now",
    titleColor: "text-sage",
  },
  {
    icon: <Camera size={14} weight="fill" className="text-emerald-400" />,
    title: "Snap & Track",
    description: "Grain bowl detected at 486 kcal.",
    meta: "98% confidence",
    titleColor: "text-emerald-400",
  },
  {
    icon: <ChartBar size={14} weight="fill" className="text-violet-400" />,
    title: "This Week",
    description: "Protein goal hit on 5 of the last 7 days.",
    meta: "Momentum is building",
    titleColor: "text-violet-400",
  },
];

const TRUST = ["No credit card", "Free forever tier", "SOC 2 ready"] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B1E12] pt-32 pb-24 md:pt-40 md:pb-28">
      <MovingGrid className="-z-20" opacity={0.16} speed={30} cell={34} />
      <div className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[620px] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(94,138,105,0.24),transparent_72%)]" />
      <div className="pointer-events-none absolute left-[-10%] top-[18%] -z-10 h-[320px] w-[320px] rounded-full bg-sage/14 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-8%] top-[12%] -z-10 h-[420px] w-[420px] rounded-full bg-[#d8b26f]/10 blur-[140px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-cream to-transparent" />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] lg:gap-10 xl:grid-cols-[300px_minmax(0,1fr)_minmax(420px,560px)]">
          <div className="hidden xl:flex xl:justify-end">
            <Reveal trigger="onLoad" delay={0.45}>
              <DisplayCards cards={TRACKING_CARDS} />
            </Reveal>
          </div>

          <RevealGroup
            trigger="onLoad"
            className="relative z-10 flex max-w-[580px] flex-col items-start gap-7 lg:max-w-none"
          >
            <Reveal
              as="span"
              className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-white/10 px-4 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.18em] text-sage/90 backdrop-blur"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
              AI nutrition, ready for production
            </Reveal>

            <Reveal
              as="h1"
              className="font-display text-[48px] font-bold leading-[0.98] tracking-[-0.03em] text-white sm:text-[58px] lg:text-[72px]"
            >
              Eat with <span className="italic text-sage">clarity.</span>
              <br />
              Ship with <span className="italic text-sage">confidence.</span>
            </Reveal>

            <Reveal
              as="p"
              className="max-w-[540px] text-[17px] leading-[1.55] text-white/68 md:text-[18px]"
            >
              NutriAI turns a photo or a line of text into calories, macros,
              and coaching you can trust, then exposes the same nutrition
              engine through a product-ready API.
            </Reveal>

            <Reveal className="flex flex-wrap items-center gap-3 pt-1">
              <Button href="#get-started" size="lg">
                Start free
              </Button>
              <Button
                href="#how"
                variant="ghost"
                size="lg"
                className="text-white decoration-white/25 hover:bg-white/8 hover:decoration-white/60"
              >
                See how it works
              </Button>
            </Reveal>

            <Reveal className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-white/55">
              {TRUST.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check size={14} weight="bold" className="text-sage" />
                  {item}
                </span>
              ))}
            </Reveal>
          </RevealGroup>

          <Reveal
            trigger="onLoad"
            delay={0.25}
            className="relative mx-auto w-full max-w-[520px] lg:max-w-none"
          >
            <div className="absolute -left-24 top-20 hidden xl:block">
              <DisplayCards cards={AI_CARDS} />
            </div>

            <PhoneMockup />

            <StatusPill className="absolute -left-3 top-8 hidden sm:flex md:-left-10">
              <Sparkle size={14} weight="fill" className="text-sage-600" />
              What&rsquo;s my protein left today?
            </StatusPill>

            <InsightCard className="absolute -right-1 top-28 hidden md:block md:-right-8" />

            <StreakCard className="absolute -left-2 bottom-10 hidden sm:flex md:-left-12" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto aspect-[18/35] w-full max-w-[380px]">
      <div className="absolute inset-4 -z-10 rounded-[56px] bg-sage/12 blur-3xl" />

      <div className="relative h-full w-full overflow-hidden rounded-[46px] border-[10px] border-ink bg-linear-to-b from-[#F7F3E9] via-cream to-[#ECE6D6] shadow-[0_45px_120px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-ink" />

        <div className="flex h-full flex-col gap-4 px-5 pt-10 pb-6">
          <div className="flex items-center justify-between">
            <span className="font-display text-[14px] font-bold tracking-tight text-ink">
              NutriAI
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-sage-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage-600" />
              Analyzing
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-linear-to-br from-[#E7EEE2] to-[#D4E1D7] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <MealIllustration className="h-36 w-full" />
            <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-forest shadow-sm backdrop-blur">
              98% match
            </span>
          </div>

          <div>
            <p className="text-[13px] font-semibold leading-snug text-ink">
              Grain bowl · salmon, roasted carrots &amp; greens
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              <span className="font-display text-[15px] font-bold text-forest">
                486
              </span>
              <span className="ml-1">kcal · logged to lunch</span>
            </p>
          </div>

          <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-ink/5 bg-white/70 p-2.5 backdrop-blur">
            {[
              { v: "34g", k: "Protein" },
              { v: "42g", k: "Carbs" },
              { v: "18g", k: "Fat" },
              { v: "7g", k: "Fiber" },
            ].map((macro) => (
              <div key={macro.k} className="flex flex-col items-center gap-0.5">
                <span className="font-display text-[13px] font-bold text-ink">
                  {macro.v}
                </span>
                <span className="text-[8.5px] uppercase tracking-[0.12em] text-ink-muted">
                  {macro.k}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-ink/5 bg-white/70 p-3 backdrop-blur">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              <span>Today</span>
              <span>Target</span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="font-display text-[16px] font-bold text-ink">
                1,462
              </span>
              <span className="font-display text-[13px] font-bold text-ink-muted">
                2,150
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
              <div
                className="h-full rounded-full bg-linear-to-r from-sage to-sage-600"
                style={{ width: "68%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MealIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 160"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <radialGradient id="hero-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#F4EEDF" />
          <stop offset="100%" stopColor="#D8E3D8" />
        </radialGradient>
        <linearGradient id="hero-bowl" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2A2E28" />
          <stop offset="100%" stopColor="#101310" />
        </linearGradient>
        <radialGradient id="hero-grains" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E9DAB4" />
          <stop offset="100%" stopColor="#C4AE82" />
        </radialGradient>
      </defs>

      <rect width="320" height="160" fill="url(#hero-bg)" />

      <g
        stroke="rgba(94,138,105,0.35)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M130 28 q6 -10 0 -20" />
        <path d="M160 20 q6 -10 0 -20" />
        <path d="M190 28 q6 -10 0 -20" />
      </g>

      <ellipse cx="160" cy="138" rx="92" ry="10" fill="rgba(31,59,45,0.18)" />
      <ellipse cx="160" cy="100" rx="95" ry="30" fill="url(#hero-bowl)" />
      <ellipse cx="160" cy="96" rx="88" ry="26" fill="url(#hero-grains)" />

      <g>
        <path
          d="M118 86 q16 -14 40 -6 q10 4 6 14 q-20 10 -46 -8 Z"
          fill="#E8896A"
        />
        <path
          d="M124 92 q14 -8 32 -2 q6 2 4 8 q-16 6 -36 -6"
          fill="#F1A688"
          opacity="0.7"
        />
      </g>
      <g transform="translate(40 -2)">
        <path
          d="M118 86 q16 -14 40 -6 q10 4 6 14 q-20 10 -46 -8 Z"
          fill="#D97856"
        />
        <path
          d="M124 92 q14 -8 32 -2 q6 2 4 8 q-16 6 -36 -6"
          fill="#EF9575"
          opacity="0.7"
        />
      </g>

      <g fill="#D58A3F">
        <ellipse cx="210" cy="98" rx="8" ry="5" transform="rotate(-18 210 98)" />
        <ellipse cx="226" cy="104" rx="8" ry="5" transform="rotate(22 226 104)" />
      </g>

      <g fill="#3D6A45">
        <path d="M102 88 q4 -8 12 -8 q6 0 6 6 q-8 6 -18 2 Z" />
        <path d="M96 102 q6 -6 14 -4 q4 2 2 6 q-10 4 -16 -2 Z" />
        <path d="M220 84 q6 -6 12 -4 q4 2 2 6 q-8 4 -14 -2 Z" />
      </g>

      <g>
        <circle cx="140" cy="92" r="5" fill="#C2503D" />
        <circle cx="138.5" cy="90.5" r="1.3" fill="#E88C7A" />
        <circle cx="186" cy="96" r="5" fill="#B4473A" />
        <circle cx="184.5" cy="94.5" r="1.3" fill="#E88C7A" />
      </g>

      <g fill="#F6EBC9">
        <ellipse cx="156" cy="88" rx="1.1" ry="0.6" />
        <ellipse cx="170" cy="90" rx="1.1" ry="0.6" />
        <ellipse cx="178" cy="86" rx="1.1" ry="0.6" />
        <ellipse cx="150" cy="94" rx="1.1" ry="0.6" />
      </g>
    </svg>
  );
}

function StatusPill({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`pointer-events-none flex items-center gap-2 rounded-full border border-white/80 bg-white/92 px-3.5 py-2 text-[12.5px] font-medium text-ink shadow-[0_18px_42px_rgba(0,0,0,0.18)] backdrop-blur-md [animation:float_6s_ease-in-out_infinite] ${className}`}
    >
      {children}
    </div>
  );
}

function InsightCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none w-[220px] rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_24px_48px_rgba(0,0,0,0.18)] backdrop-blur [animation:float_7s_ease-in-out_infinite] ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-sage/20 text-sage-600">
          <Sparkle size={14} weight="fill" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-[12.5px] font-bold text-ink">
            Coach Ria
          </p>
          <p className="text-[9px] uppercase tracking-[0.14em] text-sage-600">
            Your AI nutritionist
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11.5px] leading-snug text-ink-muted">
        You&rsquo;re <span className="font-semibold text-ink">42g short</span> on
        protein. A salmon bowl at dinner closes most of the gap.
      </p>
    </div>
  );
}

function StreakCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex items-center gap-3 rounded-2xl border border-white/80 bg-forest px-3.5 py-2.5 text-cream shadow-[0_24px_48px_rgba(0,0,0,0.24)] [animation:float_8s_ease-in-out_infinite] ${className}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage/25 text-sage">
        <Flame size={18} weight="fill" />
      </span>
      <div className="leading-tight">
        <p className="text-[9.5px] uppercase tracking-[0.18em] text-sage">
          Streak
        </p>
        <p className="font-display text-[18px] font-bold">12 days</p>
      </div>
    </div>
  );
}
