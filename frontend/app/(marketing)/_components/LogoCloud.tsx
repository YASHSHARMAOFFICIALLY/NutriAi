import { Container } from "../_primitives/Container";
import { Reveal } from "../_primitives/Reveal";

// Muted trust row. Wordmark SVGs kept inline and neutral so the landing
// doesn't read as "fake logo soup" — each is a generic fintech/SaaS
// silhouette at 40% opacity. Swap for real partner marks when they ship.
const WORDMARKS = ["PROTEIN CO", "KINETIC", "HEALTHSPAN", "NORTHSTAR", "VERDANT", "PRIMAL"] as const;

export function LogoCloud() {
  return (
    <section className="pt-24 md:pt-32">
      <Container>
        <Reveal as="p" className="text-center text-[12px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          Loved by 12,000+ people who are serious about what they eat
        </Reveal>
        <Reveal className="mt-8">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-6 md:grid-cols-6">
            {WORDMARKS.map((mark) => (
              <li
                key={mark}
                className="text-center font-display text-[15px] font-semibold tracking-[0.18em] text-ink-muted/60"
              >
                {mark}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
