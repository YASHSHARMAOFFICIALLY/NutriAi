import { Camera, Notebook, ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import { Container } from "../_primitives/Container";
import { Reveal } from "../_primitives/Reveal";

const STEPS = [
  {
    icon: Camera,
    title: "Snap",
    copy: "Upload a photo, drop a description, or paste a restaurant menu. Any input, one endpoint.",
  },
  {
    icon: Notebook,
    title: "Log",
    copy: "Save the analysis to a meal — breakfast, lunch, dinner, snack — and roll it into today’s totals.",
  },
  {
    icon: ArrowsClockwise,
    title: "Adapt",
    copy: "Streaks, target adherence, and meal recommendations recalibrate nightly — the plan follows your actual behavior.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="relative py-28 md:py-36">
      <Container>
        <div className="mx-auto mb-16 max-w-[680px] text-center">
          <Reveal as="p" className="text-[12px] font-medium uppercase tracking-[0.2em] text-sage-600">
            How it works
          </Reveal>
          <Reveal as="h2" className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-5xl">
            Three steps. Zero spreadsheets.
          </Reveal>
        </div>

        <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal as="li" key={step.title}>
                <div className="flex h-full flex-col gap-5 rounded-3xl border border-white/60 bg-cream-2/60 p-7 backdrop-blur shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-6px_14px_rgba(31,59,45,0.05)]">
                  <div className="flex items-center gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[13px] font-bold text-forest shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_3px_8px_rgba(31,59,45,0.08)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Icon size={26} weight="duotone" className="text-sage-600" />
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-[-0.01em] text-ink">
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-[1.5] text-ink-muted">{step.copy}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
