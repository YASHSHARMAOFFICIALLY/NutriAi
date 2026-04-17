import { Container } from "../_primitives/Container";
import { Button } from "../_primitives/Button";
import { Reveal, RevealGroup } from "../_primitives/Reveal";
import { MovingGrid } from "../_primitives/MovingGrid";

export function FinalCTA() {
  return (
    <section id="get-started" className="relative overflow-hidden py-32 md:py-44">
      <MovingGrid className="-z-10" opacity={0.4} speed={32} cell={30} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_70%_at_50%_50%,rgba(127,166,135,0.25),transparent_70%)]" />

      <Container className="text-center">
        <RevealGroup className="mx-auto flex max-w-[820px] flex-col items-center gap-8">
          <Reveal as="h2" className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.025em] text-ink md:text-7xl">
            Eat with <span className="italic text-forest">clarity.</span>
          </Reveal>
          <Reveal as="p" className="max-w-[560px] text-[17px] leading-[1.5] text-ink-muted md:text-xl">
            Stop guessing. Start logging in seconds, with a plan that actually adapts to what you eat.
          </Reveal>
          <Reveal>
            <Button href="/auth/google" size="lg">
              Get started free
            </Button>
          </Reveal>
          <Reveal as="p" className="text-[13px] text-ink-muted">
            Free forever plan · No credit card required
          </Reveal>
        </RevealGroup>
      </Container>
    </section>
  );
}
