import { Check, Flame, Lightning, Star, Sparkle, Camera, ChartBar } from "@phosphor-icons/react/dist/ssr";
import { Container } from "../_primitives/Container";
import { Button } from "../_primitives/Button";
import { Reveal, RevealGroup } from "../_primitives/Reveal";
import { DisplayCards, type CardData } from "../_primitives/DisplayCards";

const TRACKING_CARDS: CardData[] = [
  {
    icon: <Flame size={14} weight="fill" className="text-orange-400" />,
    title: "Streak",
    description: "12 days in a row — best yet!",
    meta: "Personal record",
    titleColor: "text-orange-400",
  },
  {
    icon: <Lightning size={14} weight="fill" className="text-yellow-400" />,
    title: "Calories",
    description: "1,462 / 2,150 kcal logged today",
    meta: "Tracked with Snap",
    titleColor: "text-yellow-400",
  },
  {
    icon: <Star size={14} weight="fill" className="text-sky-400" />,
    title: "Protein",
    description: "82g hit — 46g left to target",
    meta: "Goal: 128g / day",
    titleColor: "text-sky-400",
  },
];

const AI_CARDS: CardData[] = [
  {
    icon: <Sparkle size={14} weight="fill" className="text-sage" />,
    title: "Coach Ria",
    description: "Add salmon tonight — closes your gap.",
    meta: "AI Nutritionist · just now",
    titleColor: "text-sage",
  },
  {
    icon: <Camera size={14} weight="fill" className="text-emerald-400" />,
    title: "Snap & Track",
    description: "Grain bowl detected · 486 kcal",
    meta: "98% confidence match",
    titleColor: "text-emerald-400",
  },
  {
    icon: <ChartBar size={14} weight="fill" className="text-violet-400" />,
    title: "This Week",
    description: "Protein goal hit 5 of 7 days.",
    meta: "Your best week yet",
    titleColor: "text-violet-400",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B1E12] pt-32 md:pt-44">
      {/* Subtle dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(127,166,135,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top radial glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[600px] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(94,138,105,0.2),transparent_70%)]" />

      {/* Bottom fade — transitions dark hero into cream body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-cream to-transparent" />

      <Container>
        <div className="grid grid-cols-1 items-center gap-12 pb-40 md:grid-cols-2 md:gap-8 xl:grid-cols-[300px_1fr_300px] xl:gap-6">

          {/* ── LEFT cards — xl only ── */}
          <Reveal
            trigger="onLoad"
            delay={0.5}
            className="hidden min-h-[220px] xl:flex xl:items-center xl:justify-end"
          >
            <DisplayCards cards={TRACKING_CARDS} />
          </Reveal>

          {/* ── CENTER copy ── */}
          <RevealGroup
            trigger="onLoad"
            className="relative z-10 flex flex-col items-center gap-7 text-center"
          >
            <Reveal as="span" className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-white/10 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-sage/90 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
              AI Nutrition, Ready for Production
            </Reveal>

            <Reveal as="h1" className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.025em] text-white md:text-6xl lg:text-[72px]">
              Eat with{" "}
              <span className="italic text-sage">clarity.</span>
              <br />
              Ship with{" "}
              <span className="italic text-sage">confidence.</span>
            </Reveal>

            <Reveal as="p" className="max-w-[480px] text-[17px] leading-[1.5] text-white/55">
              NutriAI turns a photo or a line of text into calories, macros, and a
              plan — wrapped in a developer API you can drop into any product.
            </Reveal>

            <Reveal className="flex flex-wrap items-center justify-center gap-3">
              <Button href="#get-started" size="lg">
                Start free
              </Button>
              <a
                href="#how"
                className="text-base font-medium text-white/55 underline decoration-white/25 underline-offset-4 transition-colors duration-200 hover:text-white/90 hover:decoration-white/60"
              >
                See how it works
              </a>
            </Reveal>

            <Reveal className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-white/35">
              {["No credit card", "Free forever tier", "SOC 2 ready"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={12} weight="bold" className="text-sage" />
                  {t}
                </span>
              ))}
            </Reveal>
          </RevealGroup>

          {/* ── RIGHT cards — md+ ── */}
          <Reveal
            trigger="onLoad"
            delay={0.35}
            className="hidden min-h-[220px] md:flex md:items-center md:justify-start"
          >
            <DisplayCards cards={AI_CARDS} />
          </Reveal>

        </div>
      </Container>
    </section>
  );
}
