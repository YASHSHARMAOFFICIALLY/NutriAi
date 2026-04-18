import { Check } from "@phosphor-icons/react/dist/ssr";
import { Container } from "../_primitives/Container";
import { Button } from "../_primitives/Button";
import { Reveal } from "../_primitives/Reveal";

type Plan = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: readonly string[];
  cta: string;
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Log meals, see macros, hit your streak.",
    features: ["20 AI analyses / month", "Text + photo input", "Daily summaries & streaks"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "per month",
    tagline: "Unlimited analyses, personalization, and the AI chat assistant.",
    features: [
      "Unlimited AI analyses",
      "Personalized BMR / TDEE targets",
      "AI chat assistant (full history)",
      "Meal recommendations",
      "Streak + adherence analytics",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28 md:py-36">
      <Container>
        <div className="mx-auto mb-14 max-w-[680px] text-center">
          <Reveal as="p" className="text-[12px] font-medium uppercase tracking-[0.2em] text-sage-600">
            Pricing
          </Reveal>
          <Reveal as="h2" className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-5xl">
            Simple pricing. No credit card to start.
          </Reveal>
        </div>

        <div className="mx-auto grid max-w-[740px] grid-cols-1 gap-5 md:grid-cols-2">
          {PLANS.map((plan) => (
            <Reveal key={plan.name}>
              <div
                className={
                  plan.highlight
                    ? "relative flex h-full flex-col gap-6 rounded-3xl border-2 border-sage bg-white/80 p-8 backdrop-blur shadow-[0_20px_50px_rgba(31,59,45,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]"
                    : "relative flex h-full flex-col gap-6 rounded-3xl border border-white/70 bg-white/55 p-8 backdrop-blur shadow-[0_10px_30px_rgba(31,59,45,0.06),inset_0_1px_0_rgba(255,255,255,0.7)]"
                }
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-forest px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream">
                    Most popular
                  </span>
                )}
                <div>
                  <p className="font-display text-[15px] font-bold uppercase tracking-[0.18em] text-sage-600">
                    {plan.name}
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold tracking-[-0.03em] text-ink">
                      {plan.price}
                    </span>
                    <span className="text-[13px] text-ink-muted">{plan.cadence}</span>
                  </div>
                  <p className="mt-3 text-[14px] leading-[1.5] text-ink-muted">{plan.tagline}</p>
                </div>
                <ul className="flex flex-col gap-2.5 text-[14px] text-ink">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-sage-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  <Button href="#get-started" variant={plan.highlight ? "primary" : "ghost"} className="w-full justify-center">
                    {plan.cta}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal as="p" className="mt-10 text-center text-[13px] text-ink-muted">
          No credit card required · Cancel anytime · Student &amp; non-profit discounts available
        </Reveal>
      </Container>
    </section>
  );
}
