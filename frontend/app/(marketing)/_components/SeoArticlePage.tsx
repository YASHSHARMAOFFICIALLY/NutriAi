import Link from "next/link";
import { ArrowRight, Check, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import type { SeoPage } from "../seoPages";
import { PublicMealEstimator } from "./PublicMealEstimator";

export function SeoArticlePage({ page, relatedPages = [] }: { page: SeoPage; relatedPages?: SeoPage[] }) {
  return (
    <main className="min-h-screen bg-[#f8f8f3] text-[#101510]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#173c2b]">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[#173c2b] text-white">
              <ForkKnife size={17} weight="bold" />
            </span>
            myNutriAI
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-[#173c2b] px-4 py-2 text-[14px] font-bold text-white transition hover:bg-[#1f4d38]"
          >
            Start tracking
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </header>

      <nav aria-label="Breadcrumb" className="border-b border-black/6 bg-white/60">
        <ol className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-3 text-[13px] text-[#5f675f] lg:px-8">
          <li><Link href="/" className="hover:text-[#173c2b]">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/guides" className="hover:text-[#173c2b]">Guides</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-[#173c2b]">{page.primaryKeyword}</li>
        </ol>
      </nav>

      <article>
        <section className="border-b border-black/10 bg-[#101510] px-5 py-20 text-white lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#d7ff68]">{page.eyebrow}</p>
              <h1 className="mt-5 max-w-4xl text-[42px] font-semibold leading-[0.98] md:text-[62px]">
                {page.title}
              </h1>
              <p className="mt-6 max-w-2xl text-[18px] leading-8 text-white/76">{page.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d7ff68] px-6 py-3.5 text-[15px] font-bold text-[#101510] transition hover:bg-white"
                >
                  Log first meal
                  <ArrowRight size={16} weight="bold" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/16"
                >
                  View product
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-white/12 bg-white/8 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur">
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#d7ff68]">Search intent</p>
              <h2 className="mt-3 text-[28px] font-semibold">Built for {page.primaryKeyword}</h2>
              <div className="mt-5 grid gap-3">
                {page.secondaryKeywords.map((keyword) => (
                  <div key={keyword} className="flex items-center gap-3 rounded-lg bg-white/10 p-3 text-[14px] font-semibold text-white/80">
                    <Check size={16} weight="bold" className="text-[#d7ff68]" />
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div className="rounded-lg border border-black/10 bg-white p-5 shadow-[0_12px_36px_rgba(16,21,16,0.05)]">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0f8b8d]">On this page</p>
                <nav className="mt-4 grid gap-2 text-[14px] font-semibold text-[#5f675f]">
                  <a href="#overview" className="hover:text-[#173c2b]">Overview</a>
                  <a href="#use-cases" className="hover:text-[#173c2b]">Use cases</a>
                  <a href="#workflow" className="hover:text-[#173c2b]">Workflow</a>
                  <a href="#faq" className="hover:text-[#173c2b]">FAQ</a>
                  {relatedPages.length ? <a href="#related" className="hover:text-[#173c2b]">Related guides</a> : null}
                </nav>
              </div>
            </aside>

            <div className="space-y-14">
              <section id="overview">
                <p className="text-[18px] leading-8 text-[#5f675f]">{page.intro}</p>
              </section>

              <PublicMealEstimator compact defaultMeal={page.exampleMeal} />

              <section id="use-cases">
                <h2 className="text-[34px] font-semibold leading-tight text-[#173c2b]">Where myNutriAI helps</h2>
                <div className="mt-7 grid gap-4 md:grid-cols-3">
                  {page.useCases.map((item) => (
                    <div key={item.title} className="rounded-lg border border-black/10 bg-white p-5">
                      <h3 className="text-[18px] font-bold text-[#173c2b]">{item.title}</h3>
                      <p className="mt-3 text-[14px] leading-6 text-[#5f675f]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="workflow">
                <h2 className="text-[34px] font-semibold leading-tight text-[#173c2b]">How it works</h2>
                <div className="mt-7 grid gap-3">
                  {page.steps.map((step, index) => (
                    <div key={step.title} className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 md:grid-cols-[56px_1fr]">
                      <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#d7ff68] text-[18px] font-bold text-[#101510]">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-[20px] font-bold text-[#173c2b]">{step.title}</h3>
                        <p className="mt-2 text-[15px] leading-7 text-[#5f675f]">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="faq">
                <h2 className="text-[34px] font-semibold leading-tight text-[#173c2b]">Frequently asked questions</h2>
                <div className="mt-7 space-y-3">
                  {page.faqs.map((faq) => (
                    <details key={faq.question} className="rounded-lg border border-black/10 bg-white p-5">
                      <summary className="cursor-pointer list-none text-[17px] font-bold text-[#173c2b]">
                        {faq.question}
                      </summary>
                      <p className="mt-3 border-t border-black/8 pt-3 text-[15px] leading-7 text-[#5f675f]">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {relatedPages.length ? (
                <section id="related">
                  <h2 className="text-[34px] font-semibold leading-tight text-[#173c2b]">Related nutrition guides</h2>
                  <div className="mt-7 grid gap-4 md:grid-cols-2">
                    {relatedPages.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/${related.slug}`}
                        className="rounded-lg border border-black/10 bg-white p-5 transition hover:border-[#0f8b8d]/40 hover:shadow-[0_14px_36px_rgba(16,21,16,0.08)]"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">{related.eyebrow}</p>
                        <h3 className="mt-2 text-[20px] font-bold leading-snug text-[#173c2b]">{related.title}</h3>
                        <p className="mt-3 text-[14px] leading-6 text-[#5f675f]">{related.description}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-xl bg-[#d7ff68] p-8">
                <h2 className="max-w-2xl text-[34px] font-semibold leading-tight text-[#101510]">
                  Make nutrition tracking faster than searching a food database.
                </h2>
                <p className="mt-4 max-w-xl text-[16px] leading-7 text-[#101510]/70">
                  Start with one meal, review the estimate, and let myNutriAI build your daily nutrition context from there.
                </p>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#101510] px-6 py-3 text-[14px] font-bold text-white transition hover:bg-[#173c2b]"
                >
                  Try myNutriAI
                  <ArrowRight size={15} weight="bold" />
                </Link>
              </section>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
