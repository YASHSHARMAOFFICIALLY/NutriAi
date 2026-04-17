import { Terminal, Key, Gauge } from "@phosphor-icons/react/dist/ssr";
import { Container } from "../_primitives/Container";
import { Reveal } from "../_primitives/Reveal";

const SNIPPET = `# 1. Issue a scoped key (auth'd user)
curl -X POST https://api.nutriai.dev/api-keys \\
  -H "Authorization: Bearer $ACCESS" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"partner","scopes":["calories:read"]}'

# 2. Call the public surface
curl -X POST https://api.nutriai.dev/v1/public/calories \\
  -H "x-api-key: $API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"text":"2 boiled eggs and a slice of toast"}'
# => { calories: 235, protein: 16, carbs: 18, fat: 11 }`;

const FEATURES = [
  { icon: Key, title: "Scoped API keys", copy: "nk_<prefix>.<secret>. Shown once, SHA-256 at rest. Per-key scopes." },
  { icon: Gauge, title: "60 rpm per key", copy: "Redis token bucket, metered into ApiUsage on every response-finish." },
  { icon: Terminal, title: "Thin, stateless", copy: "One endpoint: POST /v1/public/calories. Text or imageUrl. JSON in, JSON out." },
] as const;

export function DeveloperAPI() {
  return (
    <section id="developers" className="relative mt-16 overflow-hidden bg-forest py-28 text-cream md:py-36">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(127,166,135,0.35) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <Container className="relative">
        <div className="grid grid-cols-1 items-start gap-14 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <Reveal>
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-sage">
              Developers
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-cream md:text-5xl">
              A calorie API your team can ship against today.
            </h2>
            <p className="mt-5 max-w-[520px] text-[17px] leading-[1.5] text-cream/70">
              NutriAI exposes the same vision + text analysis layer as a thin, stateless B2B API. Issue a scoped key, hit one endpoint, get JSON.
            </p>
            <ul className="mt-8 flex flex-col gap-5">
              {FEATURES.map(({ icon: Icon, title, copy }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="mt-1 grid h-9 w-9 place-items-center rounded-xl bg-cream/10 text-sage">
                    <Icon size={18} weight="duotone" />
                  </span>
                  <div>
                    <p className="font-display text-[17px] font-bold tracking-tight text-cream">
                      {title}
                    </p>
                    <p className="mt-0.5 text-[14px] leading-[1.5] text-cream/65">{copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-cream/10 bg-[#12231C] shadow-[0_30px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 border-b border-cream/10 bg-[#0E1A15] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF6A5A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F6C24E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-sage" />
                <span className="ml-3 text-[11px] uppercase tracking-[0.2em] text-cream/50">
                  terminal
                </span>
              </div>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.7] text-cream/90" data-lenis-prevent>
                <code>{SNIPPET}</code>
              </pre>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
