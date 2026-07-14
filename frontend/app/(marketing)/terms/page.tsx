import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import { siteName, siteUrl } from "../../seo";

const LAST_UPDATED = "June 11, 2026";
const SUPPORT_EMAIL = "support@mynutriai.app";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Plain-English Terms of Service for myNutriAI, the AI meal scanner. What you agree to when you track meals, the limits of AI estimates, and how billing works.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: `Terms of Service | ${siteName}`,
    description:
      "Plain-English Terms of Service for myNutriAI, the AI meal scanner. What you agree to when you track meals, the limits of AI estimates, and how billing works.",
    url: `${siteUrl}/terms`,
    siteName,
  },
};

export default function TermsPage() {
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
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-3 text-[13px] text-[#5f675f] lg:px-8">
          <Link href="/" className="hover:text-[#173c2b]">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#173c2b]">Terms of Service</span>
        </div>
      </nav>

      <article className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0f8b8d]">Legal</p>
          <h1 className="mt-4 text-[40px] font-semibold leading-tight text-[#173c2b] md:text-[52px]">
            Terms of Service
          </h1>
          <p className="mt-5 text-[15px] text-[#5f675f]">Last updated: {LAST_UPDATED}</p>

          <div className="mt-12 space-y-12 text-[16px] leading-8 text-[#5f675f]">
            <section>
              <p>
                These terms cover your use of myNutriAI, an AI nutrition tracker that estimates calories
                and macros from meal photos and text. By creating an account or using the product, you
                agree to what is written here. We try to keep this honest and readable rather than dense.
                myNutriAI is an early-stage, founder-run product, so some features change quickly.
              </p>
            </section>

            <Section title="Who can use myNutriAI">
              <p>
                You need to be old enough to form a binding agreement where you live, and at least 16. The
                product is for personal nutrition tracking, not for clinical, diagnostic, or commercial use.
                You are responsible for keeping your login secure and for activity under your account.
              </p>
            </Section>

            <Section title="Estimates are not medical advice">
              <p>
                Calorie and macro figures, coach suggestions, and recommendations are AI-generated
                estimates. They can be wrong, sometimes meaningfully so, which is why every meal stays
                editable before you save it. myNutriAI is not a doctor, dietitian, or medical device.
                Nothing here is medical, nutritional, or health advice. Talk to a qualified professional
                before making decisions about your diet, especially if you have a medical condition,
                are pregnant, or are managing an eating disorder.
              </p>
            </Section>

            <Section title="Your content">
              <p>
                You keep ownership of the meals, photos, weight entries, and profile details you add. You
                grant us permission to process that content so the product can run, for example sending a
                meal photo to our analysis provider to return an estimate. We do not sell your data, and we
                do not use your meals to advertise to you.
              </p>
            </Section>

            <Section title="Service providers we rely on">
              <p>
                To run myNutriAI we share the minimum data needed with a small set of third parties:
              </p>
              <ul className="mt-4 space-y-2">
                <Item><strong className="font-semibold text-[#173c2b]">OpenAI</strong> — analyzes meal text and photos to return calorie and macro estimates.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Dodo Payments</strong> — processes Pro and lifetime subscription billing.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Resend</strong> — sends account and notification emails.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">AWS S3</strong> — stores the meal images you upload.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Cloudflare</strong> — hosts and serves the app.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Telegram</strong> — optional, only if you connect the Telegram meal-logging bot.</Item>
              </ul>
              <p className="mt-4">
                Each provider handles your data under its own terms. Our{" "}
                <Link href="/privacy" className="font-semibold text-[#173c2b] underline underline-offset-2 hover:text-[#0f8b8d]">
                  Privacy Policy
                </Link>{" "}
                explains what is shared and why.
              </p>
            </Section>

            <Section title="Plans and billing">
              <p>
                The Free plan stays free and needs no card. Pro is a recurring monthly subscription, and
                Pro Lifetime is a one-time payment, both handled by Dodo Payments. You can cancel a Pro
                subscription at any time and keep access through the period you already paid for; we do not
                charge again after you cancel. Prices and plan limits can change, and we will give notice
                before any change affects an active subscription.
              </p>
            </Section>

            <Section title="Acceptable use">
              <p>
                Please do not abuse the AI features, attempt to break or overload the service, scrape it,
                resell access, or upload content you do not have the right to share. We may pause or close
                accounts that do, or that put the service or other users at risk.
              </p>
            </Section>

            <Section title="Cancelling and deleting your account">
              <p>
                You can delete your account at any time from Settings. Deleting removes your meals, photos,
                weight history, and profile from active systems, as described in the Privacy Policy. We may
                also discontinue the service or specific features; if we plan to shut down, we will give
                reasonable notice so you can export or delete your data first.
              </p>
            </Section>

            <Section title="No warranty and limits">
              <p>
                myNutriAI is provided &ldquo;as is.&rdquo; We work to keep it accurate and available, but we
                cannot promise the estimates are correct or that the service will be uninterrupted or
                error-free. To the extent the law allows, we are not liable for indirect or consequential
                losses, or for decisions you make based on the app&rsquo;s estimates.
              </p>
            </Section>

            <Section title="Changes to these terms">
              <p>
                As the product grows, these terms may change. When they do, we will update the date at the
                top and, for material changes, let you know in the app or by email. Continuing to use
                myNutriAI after a change means you accept the updated terms.
              </p>
            </Section>

            <Section title="Governing terms and contact">
              <p>
                These terms are governed by the laws applicable at our principal place of business, without
                forcing a venue that is unreasonable for you. If something here turns out to be
                unenforceable, the rest still applies.
              </p>
              <p className="mt-4">
                Questions about these terms? Email us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#173c2b] underline underline-offset-2 hover:text-[#0f8b8d]">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </article>

      <footer className="border-t border-black/10 bg-white px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[13px] text-[#5f675f]">
          <p>&copy; 2026 myNutriAI</p>
          <div className="flex items-center gap-5 font-semibold text-[#173c2b]">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/" className="hover:underline">Back to home</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[26px] font-semibold leading-tight text-[#173c2b]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f8b8d]" />
      <span>{children}</span>
    </li>
  );
}
