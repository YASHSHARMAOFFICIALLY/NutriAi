import { Container } from "../_primitives/Container";

const GROUPS = [
  { title: "Product", links: ["Features", "How it works", "Pricing", "Changelog"] },
  { title: "Resources", links: ["Help center", "Community", "Blog", "Recipes"] },
  { title: "Company", links: ["About", "Careers", "Contact", "Press"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "Accessibility"] },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-cream-2/60 py-16">
      <Container>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <p className="font-display text-2xl font-bold tracking-[-0.01em] text-ink">NutriAI</p>
            <p className="mt-3 max-w-[320px] text-[14px] leading-[1.5] text-ink-muted">
              AI-powered calorie and nutrition tracking for people who want to stop guessing.
            </p>
          </div>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {g.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2 text-[14px] text-ink">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="transition-colors hover:text-forest">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-ink/5 pt-8 text-[12px] text-ink-muted md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} NutriAI. All rights reserved.</p>
          <p>Built with care for people who love food.</p>
        </div>
      </Container>
    </footer>
  );
}
