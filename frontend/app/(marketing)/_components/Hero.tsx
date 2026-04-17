import { Container } from "../_primitives/Container";
import { Button } from "../_primitives/Button";
import { Reveal, RevealGroup } from "../_primitives/Reveal";
import { MovingGrid } from "../_primitives/MovingGrid";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 md:pt-44">
      <MovingGrid className="-z-10" opacity={0.35} speed={28} cell={32} />
      <div className="absolute inset-x-0 -top-20 -z-10 h-[420px] bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(127,166,135,0.22),transparent_70%)]" />

      <Container className="text-center">
        <RevealGroup trigger="onLoad" className="mx-auto flex max-w-[880px] flex-col items-center gap-7">
          <Reveal as="span" className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-white/60 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-forest backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            AI-powered nutrition
          </Reveal>

          <Reveal as="h1" className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.02em] text-ink md:text-7xl">
            Know exactly <span className="italic text-forest">what you eat.</span>
          </Reveal>

          <Reveal as="p" className="max-w-[600px] text-balance text-[17px] leading-[1.45] text-ink-muted md:text-xl">
            Snap a meal or type it out — NutriAI returns calories, macros, and a plan that actually fits your goals. With an AI chat assistant, streaks, and a developer API.
          </Reveal>

          <Reveal className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button href="#get-started" size="lg">
              Get started free
            </Button>
            <Button href="#how" variant="ghost" size="lg">
              See how it works
            </Button>
          </Reveal>

          <Reveal as="span" className="text-[13px] text-ink-muted">
            No credit card required · Free forever plan
          </Reveal>
        </RevealGroup>

        <Reveal trigger="onLoad" delay={0.45} className="relative mx-auto mt-16 aspect-[9/5] w-full max-w-[1040px]">
          <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/70 bg-linear-to-br from-[#EAF0E6] via-[#F3EEE3] to-[#D9E4DC] shadow-[0_30px_80px_rgba(31,59,45,0.18),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur">
            {/* Placeholder hero visual — drop a real image at public/hero.jpg
                and swap this block for <Image src="/hero.jpg" fill priority /> */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="flex flex-col items-center gap-4 text-forest/70">
                <div className="flex items-center gap-8">
                  <div className="h-20 w-20 rounded-full border-[6px] border-sage/50" />
                  <div className="h-14 w-40 rounded-full bg-white/60 backdrop-blur" />
                  <div className="h-20 w-20 rounded-full border-[6px] border-forest/30" />
                </div>
                <p className="font-display text-sm uppercase tracking-[0.22em]">
                  Hero photo — drop /public/hero.jpg
                </p>
              </div>
            </div>
            {/* Floating macro rings — pure SVG so no extra asset required */}
            <svg aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 md:-right-10 md:-top-10 md:h-40 md:w-40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(127,166,135,0.35)" strokeWidth="4" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#5E8A69" strokeWidth="4" strokeDasharray="170 264" strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
