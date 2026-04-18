import { Container } from "../_primitives/Container";
import { Button } from "../_primitives/Button";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <Container className="mt-4">
        <div className="flex h-14 items-center justify-between rounded-full border border-white/60 bg-[rgba(251,248,242,0.72)] pl-6 pr-2 backdrop-blur-xl shadow-[0_6px_20px_rgba(31,59,45,0.06)]">
          <a href="#" className="font-display text-[19px] font-bold tracking-tight text-ink">
            NutriAI
          </a>
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8 text-[14px] font-medium text-ink-muted">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="transition-colors hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Button href="#get-started" size="md" className="text-[14px]">
            Get started
          </Button>
        </div>
      </Container>
    </header>
  );
}
