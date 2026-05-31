import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "../../JsonLd";
import { breadcrumbJsonLd, siteName, siteUrl } from "../../seo";
import { seoPages } from "../seoPages";

export const metadata: Metadata = {
  title: "Nutrition Tracking Guides",
  description:
    "Calorie and macro tracking guides for US and Indian meals, burrito bowls, salads, sandwiches, dal rice, paneer, biryani, protein goals, and weight loss.",
  keywords: [
    "calorie tracking guides",
    "macro tracking guides",
    "Indian meal calorie guide",
    "US meal calorie guide",
    "meal tracking tips",
  ],
  alternates: {
    canonical: `${siteUrl}/guides`,
  },
  openGraph: {
    title: `Nutrition Tracking Guides | ${siteName}`,
    description:
      "Calorie and macro tracking guides for US and Indian meals, burrito bowls, salads, sandwiches, dal rice, paneer, biryani, protein goals, and weight loss.",
    url: `${siteUrl}/guides`,
    siteName,
  },
};

export default function GuidesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "myNutriAI", url: "/" },
          { name: "Guides", url: "/guides" },
        ])}
      />
      <main className="min-h-screen bg-[#f8f8f3] text-[#101510]">
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-[#173c2b]"
            >
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
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-3 text-[13px] text-[#5f675f] lg:px-8">
            <Link href="/" className="hover:text-[#173c2b]">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#173c2b]">Guides</span>
          </div>
        </nav>

        <section className="px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0f8b8d]">
                Guides
              </p>
              <h1 className="mt-4 text-[40px] font-semibold leading-tight text-[#173c2b] md:text-[52px]">
                Calorie and macro tracking for real meals
              </h1>
              <p className="mt-5 text-[17px] leading-8 text-[#5f675f]">
                Practical guides for tracking US and Indian meals, from burrito
                bowls and salads to dal rice and paneer plates.
              </p>
            </div>

            <div className="mt-14 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {seoPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-black/10 bg-white p-6 transition hover:border-[#173c2b]/30 hover:shadow-[0_16px_42px_rgba(16,21,16,0.08)]"
                >
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">
                    {page.eyebrow}
                  </p>
                  <h2 className="mt-3 text-[18px] font-bold leading-snug text-[#173c2b]">
                    {page.primaryKeyword}
                  </h2>
                  <p className="mt-3 text-[14px] leading-6 text-[#5f675f]">
                    {page.description}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[14px] font-bold text-[#101510]">
                    Read guide
                    <ArrowRight
                      size={14}
                      weight="bold"
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-black/10 bg-white px-5 py-8 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-[13px] text-[#5f675f]">
            <p>&copy; 2026 myNutriAI</p>
            <Link href="/" className="font-semibold text-[#173c2b] hover:underline">
              Back to home
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
