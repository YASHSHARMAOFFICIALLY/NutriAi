import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import { siteName, siteUrl } from "../../seo";

const LAST_UPDATED = "June 11, 2026";
const SUPPORT_EMAIL = "support@mynutriai.app";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How myNutriAI handles your meal text, food photos, weight, and profile data. The processors we use, how long we keep data, and how to delete your account.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: `Privacy Policy | ${siteName}`,
    description:
      "How myNutriAI handles your meal text, food photos, weight, and profile data. The processors we use, how long we keep data, and how to delete your account.",
    url: `${siteUrl}/privacy`,
    siteName,
  },
};

export default function PrivacyPage() {
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
          <span className="font-semibold text-[#173c2b]">Privacy Policy</span>
        </div>
      </nav>

      <article className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0f8b8d]">Legal</p>
          <h1 className="mt-4 text-[40px] font-semibold leading-tight text-[#173c2b] md:text-[52px]">
            Privacy Policy
          </h1>
          <p className="mt-5 text-[15px] text-[#5f675f]">Last updated: {LAST_UPDATED}</p>

          <div className="mt-12 space-y-12 text-[16px] leading-8 text-[#5f675f]">
            <section>
              <p>
                myNutriAI is an AI nutrition tracker. To do its job it handles personal data about what you
                eat and your body, so this page explains, in plain terms, what we collect, who we share it
                with, how long we keep it, and the controls you have. We collect what the product needs and
                nothing we cannot explain.
              </p>
            </section>

            <Section title="What we collect">
              <ul className="mt-2 space-y-2">
                <Item><strong className="font-semibold text-[#173c2b]">Account details</strong> — your email, name if you add one, and how you signed in (email or Google).</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Meal data</strong> — the meal text and food photos you submit, plus the calorie and macro estimates we generate from them.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Body and goal data</strong> — weight entries and the profile you set, such as goals, preferences, allergies, and activity.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Usage data</strong> — basic logs and events needed to run, secure, and debug the service.</Item>
              </ul>
            </Section>

            <Section title="How we use it">
              <p>
                We use your data to estimate the nutrition of your meals, run the dashboard and coach,
                personalize recommendations, manage your account and billing, send the emails you expect,
                and keep the service secure. We do not sell your data, and we do not use your meals or
                photos to train third-party advertising profiles.
              </p>
            </Section>

            <Section title="Who we share it with">
              <p>
                We share the minimum necessary with the providers that operate parts of myNutriAI:
              </p>
              <ul className="mt-4 space-y-2">
                <Item><strong className="font-semibold text-[#173c2b]">OpenAI</strong> — receives meal text and photos to return calorie and macro estimates.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">AWS S3</strong> — stores the meal images you upload.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Dodo Payments</strong> — processes subscription and lifetime payments; handles your billing details, not us.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Resend</strong> — delivers account and notification emails.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Cloudflare</strong> — hosts and serves the application.</Item>
                <Item><strong className="font-semibold text-[#173c2b]">Telegram</strong> — only if you choose to connect the Telegram bot, so you can log meals through it.</Item>
              </ul>
              <p className="mt-4">
                Each processor uses your data under its own privacy terms and only to provide its part of
                the service. We may also disclose data if the law requires it.
              </p>
            </Section>

            <Section title="How long we keep it">
              <p>
                We keep your meals, photos, weight history, and profile for as long as your account is
                active, so your history and trends stay available to you. When you delete your account, we
                remove this data from our active systems. Routine backups and provider logs may retain
                copies for a short window before they cycle out. We keep limited billing records where the
                law requires it.
              </p>
            </Section>

            <Section title="Deleting your account and data">
              <p>
                You are in control. You can delete individual meals at any time, and you can delete your
                entire account from Settings. Account deletion removes your meals, photos, weight entries,
                and profile from active systems. If you would rather we handle it, email us and we will.
              </p>
            </Section>

            <Section title="Security">
              <p>
                Accounts use verified email flows and role-based access, uploads are kept private, and auth
                tokens are stored in secure, http-only cookies. No system is perfectly secure, but we treat
                your meal, weight, and profile data as private and design around that.
              </p>
            </Section>

            <Section title="Children">
              <p>
                myNutriAI is not intended for children under 16, and we do not knowingly collect their data.
                If you believe a child has created an account, contact us and we will remove it.
              </p>
            </Section>

            <Section title="Changes and contact">
              <p>
                If this policy changes, we will update the date above and, for material changes, notify you
                in the app or by email. Questions, requests, or data deletions? Email us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#173c2b] underline underline-offset-2 hover:text-[#0f8b8d]">
                  {SUPPORT_EMAIL}
                </a>
                . See our{" "}
                <Link href="/terms" className="font-semibold text-[#173c2b] underline underline-offset-2 hover:text-[#0f8b8d]">
                  Terms of Service
                </Link>{" "}
                for the rules that go with this policy.
              </p>
            </Section>
          </div>
        </div>
      </article>

      <footer className="border-t border-black/10 bg-white px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[13px] text-[#5f675f]">
          <p>&copy; 2026 myNutriAI</p>
          <div className="flex items-center gap-5 font-semibold text-[#173c2b]">
            <Link href="/terms" className="hover:underline">Terms</Link>
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
