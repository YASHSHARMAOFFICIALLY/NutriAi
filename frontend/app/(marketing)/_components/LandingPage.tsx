"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BellRinging,
  Camera,
  CaretDown,
  ChartLineUp,
  ChatCircleText,
  Check,
  Crosshair,
  ForkKnife,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { startCheckout } from "@/lib/checkout";
import { isPaidPlanId, PLANS, type PaidPlanId } from "@/lib/plans";
import { seoPages } from "../seoPages";
import { PublicMealEstimator } from "./PublicMealEstimator";

/*
 * Scroll choreography (per section, triggered at -60px into view, once):
 *   0ms      section header fades up
 *   +50ms/i  cards stagger in behind it
 * Hero keeps its CSS `hero-reveal` entrance; Lenis (layout.tsx) owns scroll physics.
 */
const REVEAL = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
  stagger: 0.05,
};

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={reduce ? undefined : { duration: REVEAL.duration, ease: REVEAL.ease, delay }}
    >
      {children}
    </motion.div>
  );
}

const heroImage = "/marketing/hero.webp";

const mealImage = "/marketing/meal.webp";

const phoneImage = "/marketing/phone.webp";

const proof = [
  {
    title: "Scan or type any meal",
    body: "Image and text analysis turns food into editable calories, protein, carbs, fat, and meal items.",
    icon: Camera,
  },
  {
    title: "Know the next meal",
    body: "Coach Cuckoo and recommendations use the user's day, goals, preferences, and remaining targets.",
    icon: ChatCircleText,
  },
  {
    title: "Build consistency",
    body: "Streaks, challenges, weight logs, weekly digests, and streak risk emails keep the habit alive.",
    icon: ChartLineUp,
  },
  {
    title: "Respect private data",
    body: "Verified accounts, private uploads, auth roles, and measured handling for profile and weight data.",
    icon: ShieldCheck,
  },
];

const productMoments = [
  {
    kicker: "Food analysis",
    title: "Turn a photo into an editable meal.",
    copy: "Open Snap, upload a plate, review the detected items, adjust portions, and save the nutrition to your day.",
    image: heroImage,
    icon: Camera,
  },
  {
    kicker: "Daily intelligence",
    title: "See what is left before dinner.",
    copy: "The dashboard shows calories, protein, macro gaps, recent meals, recommendations, and the next useful action.",
    image: phoneImage,
    icon: Crosshair,
  },
  {
    kicker: "Long-term progress",
    title: "Build a routine beyond one scan.",
    copy: "Meals, weight logs, challenges, analytics, family sharing, and weekly digests work together as one habit loop.",
    image: mealImage,
    icon: BellRinging,
  },
];

const faqs = [
  {
    question: "How accurate is the meal detection?",
    answer:
      "The scanner is built around real, mixed plates — home-cooked meals, bowls, wraps, and restaurant food. Results are estimates, so every item and macro can be reviewed before saving.",
  },
  {
    question: "Can I edit incorrect scans?",
    answer:
      "Yes. Users can adjust detected items, serving size, calories, protein, carbs, and fat before confirming the meal.",
  },
  {
    question: "Does this work with home-cooked and mixed meals?",
    answer:
      "That is the core positioning. myNutriAI is built for real plates — home-cooked meals, leftovers, bowls, rolls, and mixed dishes, not just packaged foods with a barcode.",
  },
  {
    question: "Does Coach Cuckoo use my daily targets?",
    answer:
      "Yes. Coach Cuckoo uses saved meals, calorie target, macro gaps, preferences, allergies, and goal context before suggesting the next meal.",
  },
  {
    question: "How is my data stored?",
    answer:
      "Accounts support verified email flows, private uploads, role-based access, and account controls. The product treats profile and weight data as private user data.",
  },
  {
    question: "Can I use myNutriAI without uploading photos?",
    answer:
      "Yes. Users can type meals manually, use recommendations, track weight, view analytics, and still get coaching from saved context.",
  },
];

const featuredSeoPages = ["ai-meal-scanner", "indian-meal-calorie-tracker", "us-meal-calorie-tracker"]
  .map((slug) => seoPages.find((page) => page.slug === slug))
  .filter((page): page is (typeof seoPages)[number] => Boolean(page));

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f6f1e7] text-[#173c2b]">
      <ScrollProgress />
      <Nav />
      <Hero />
      <PublicMealEstimator />
      <ProofStrip />
      <ProductMoments />
      <ImmersiveProduct />
      <DailyLoop />
      <Personalization />
      <Pricing />
      <FAQ />
      <SeoHub />
      <Final />
    </main>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" role="progressbar" aria-label="Page scroll progress" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full bg-[#b5651d]"
        style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
      />
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#173c2b]/10 bg-[#f6f1e7]/80 text-[#173c2b] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#173c2b] text-[#f6f1e7]">
            <ForkKnife size={17} weight="bold" />
          </span>
          myNutriAI
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-[14px] font-medium text-[#173c2b]/70 md:flex">
          <a href="#estimate" className="rounded-full border border-[#b5651d]/35 bg-[#b5651d]/10 px-3 py-1.5 text-[#b5651d] transition-colors duration-200 hover:bg-[#b5651d] hover:text-[#f6f1e7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e7]">Try demo</a>
          <a href="#product" className="transition-colors hover:text-[#173c2b]">Product</a>
          <a href="#loop" className="transition-colors hover:text-[#173c2b]">Routine</a>
          <a href="#pricing" className="transition-colors hover:text-[#173c2b]">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-[#173c2b]">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="inline-flex rounded-lg px-1 text-[14px] font-semibold text-[#173c2b]/70 transition-colors hover:text-[#173c2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e7]">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-[#173c2b] px-4 py-2 text-[14px] font-semibold text-[#f6f1e7] transition-colors duration-200 hover:bg-[#225036] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e7]"
          >
            Get started
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f6f1e7] text-[#173c2b]">
      {/* single soft warm wash — replaces the mouse spotlight + 4 stacked radial glows */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full bg-[#b5651d]/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-12 px-5 pb-20 pt-28 sm:pb-24 lg:min-h-[760px] lg:grid-cols-[minmax(0,0.92fr)_minmax(46%,1.08fr)] lg:gap-10 lg:px-8">
        <div className="max-w-[720px] lg:pb-8">
          <div className="hero-reveal mb-5 inline-flex items-center gap-2 rounded-full border border-[#173c2b]/15 bg-white/60 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#173c2b] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b5651d]" aria-hidden="true" />
            AI nutrition coach
          </div>

          <h1 className="hero-reveal hero-delay-1 display-heading text-[44px] font-semibold leading-[1.02] md:text-[60px] lg:text-[64px] xl:text-[80px]">
            Know what to eat <span className="text-[#b5651d]">next</span>, not just what you ate.
          </h1>

          <p className="hero-reveal hero-delay-2 mt-6 max-w-xl text-[16px] leading-7 text-[#4a534a] md:text-[18px] xl:text-[19px] xl:leading-8">
            Cuckoo reads your day and your targets, then names the next meal that fits. Snap a photo or type a line &mdash; tracking takes seconds.
          </p>

          <div className="hero-reveal hero-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#estimate"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173c2b] px-7 py-4 text-[16px] font-bold text-[#f6f1e7] shadow-[0_16px_40px_rgba(23,60,43,0.22)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(23,60,43,0.28)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e7]"
            >
              Scan your first meal free
              <ArrowRight size={16} weight="bold" />
            </a>
            <a
              href="#product"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#173c2b]/18 bg-white/50 px-7 py-4 text-[16px] font-semibold text-[#173c2b] backdrop-blur-sm transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e7]"
            >
              See how it works
            </a>
          </div>

          {/* honest proof line — replaces the 4 fake-stat chips */}
          <ul className="hero-reveal hero-delay-3 mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-[#4a534a]">
            {["Free to try", "Photo or text", "Telegram-ready", "Edit every estimate"].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check size={14} weight="bold" className="text-[#173c2b]" />
                {item}
              </li>
            ))}
          </ul>

          {/* mobile meal card — light reskin (HeroVisual is hidden below lg) */}
          <div className="hero-reveal hero-delay-3 mt-7 rounded-2xl border border-[#173c2b]/10 bg-white p-4 shadow-[0_12px_40px_rgba(23,60,43,0.10)] lg:hidden" aria-hidden="true">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b5651d]">Meal saved</p>
                <p className="mt-1 text-[20px] font-semibold text-[#173c2b]">Chicken rice bowl</p>
              </div>
              <span className="rounded-full bg-[#173c2b] px-3 py-1 text-[11px] font-bold text-[#f6f1e7]">92% sure</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ["612", "kcal"],
                ["42g", "pro"],
                ["58g", "carb"],
                ["19g", "fat"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-[#f1f5ef] p-2">
                  <p className="text-[15px] font-bold text-[#173c2b]">{value}</p>
                  <p className="text-[10px] font-semibold text-[#5f675f]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="hero-reveal hero-delay-2 hidden w-full items-center justify-center lg:flex" aria-hidden="true">
      <div className="relative flex aspect-[1.05/1] w-full max-w-[470px] items-center justify-center">
        {/* one soft warm halo — replaces two blur-120 halos + the bordered ring */}
        <div className="absolute inset-[16%] rounded-full bg-[#b5651d]/12 blur-[90px]" />
        <FloatingPhone />
      </div>
    </div>
  );
}

function FloatingPhone() {
  return (
    <div className="absolute left-1/2 top-[46%] z-30 w-[66%] -translate-x-1/2 -translate-y-1/2">
      <div className="relative aspect-[304/590] w-full rotate-[4deg] rounded-[14%] bg-[linear-gradient(145deg,#2a322a,#0c100c_42%,#1a211a)] p-[3%] shadow-[0_40px_90px_rgba(23,60,43,0.20),0_0_0_1px_rgba(23,60,43,0.06)] transition-transform duration-500 hover:rotate-[2deg]">
        <span className="absolute -left-1 top-[18%] h-[9%] w-1 rounded-l-full bg-white/24" />
        <span className="absolute -left-1 top-[31%] h-[13%] w-1 rounded-l-full bg-white/20" />
        <span className="absolute -right-1 top-[24%] h-[16%] w-1 rounded-r-full bg-black/45" />
        <div className="pointer-events-none absolute inset-[3%] z-20 rounded-[12%] bg-[linear-gradient(115deg,rgba(255,255,255,0.18),transparent_28%,transparent_68%,rgba(255,255,255,0.08))]" />

        <div className="relative h-full overflow-hidden rounded-[12%] bg-[#f8f8f3] text-[#173c2b]">
          <div className="absolute left-1/2 top-[2%] z-30 h-[5%] w-[32%] -translate-x-1/2 rounded-full bg-[#090d09]" />

          <div className="relative h-[31%] overflow-hidden">
            <Image
              src={phoneImage}
              alt="Healthy meal ingredients"
              fill
              sizes="(min-width: 1024px) 18vw, 80vw"
              className="object-cover saturate-[1.08] contrast-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.22))]" />
            {/* kept effect #2: the scan line tells the photo→analyzed story */}
            <div className="scan-line absolute inset-x-[7%] top-[18%] h-px bg-[#b5651d]/80 shadow-[0_0_18px_rgba(181,101,29,0.6)]" />
            <div className="absolute bottom-[8%] left-[7%] flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1.5 text-[10px] font-bold text-[#173c2b] shadow-[0_10px_28px_rgba(23,60,43,0.16)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#173c2b]" />
              Analyzed
            </div>
          </div>

          <div className="p-[5%]">
            <div className="rounded-[18px] bg-white p-[5%] shadow-[0_14px_36px_rgba(23,60,43,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f796f]">Lunch analysis</p>
                  <p className="mt-1 text-[18px] font-semibold leading-tight xl:text-[20px]">Chicken rice bowl</p>
                </div>
                <span className="rounded-full bg-[#b5651d] px-2.5 py-1 text-[10px] font-bold text-[#f6f1e7]">92% sure</span>
              </div>

              <div className="mt-3 rounded-[16px] bg-[#173c2b] p-[6%] text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-white/60">Estimated calories</p>
                    <p className="mt-0.5 text-[26px] font-semibold leading-none xl:text-[30px]">612</p>
                  </div>
                  <p className="pb-1 text-[12px] font-semibold text-[#e0b079]">kcal</p>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/16">
                  <div className="h-full w-[68%] rounded-full bg-[#e0b079]" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {["rice", "chicken", "beans", "greens"].map((item) => (
                  <div key={item} className="rounded-full border border-[#173c2b]/10 bg-[#f6f8f2] px-2.5 py-1.5 text-center text-[9px] font-bold uppercase tracking-[0.08em] text-[#173c2b]">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  ["42g", "Protein"],
                  ["58g", "Carbs"],
                  ["19g", "Fat"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[14px] bg-[#f1f5ef] p-2 text-center">
                    <p className="text-[14px] font-semibold xl:text-[15px]">{value}</p>
                    <p className="mt-0.5 text-[9px] font-semibold text-[#6f796f]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-3 w-full rounded-[16px] bg-[#173c2b] py-[4%] text-[13px] font-bold text-[#f6f1e7] shadow-[0_14px_28px_rgba(23,60,43,0.20)]">
              Confirm meal
            </button>
            <div className="mx-auto mt-3 h-1 w-[34%] rounded-full bg-[#173c2b]/22" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofStrip() {
  return (
    <section className="relative z-10 -mt-12 px-5 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-stretch gap-1 rounded-xl border border-black/8 bg-white p-2 shadow-[0_24px_70px_rgba(16,21,16,0.14)] md:grid-cols-4">
          {proof.map(({ title, body, icon: Icon }, index) => (
          <Reveal key={title} delay={index * REVEAL.stagger} className="h-full">
          <div className="group/card h-full rounded-lg p-5 transition-[background-color,box-shadow] hover:bg-[#f0f6ef] hover:shadow-[0_8px_30px_rgba(16,21,16,0.06)]">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[#eef5f2] text-[#173c2b] transition-colors group-hover/card:bg-[#b5651d] group-hover/card:text-[#10241a]">
              <Icon size={20} weight="duotone" />
            </div>
            <p className="text-[14px] font-semibold">{title}</p>
            <p className="mt-2 text-[13px] leading-5 text-[#5f675f]">{body}</p>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProductMoments() {
  return (
    <section id="product" className="px-5 py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Header eyebrow="Product flow" title="From scan to daily guidance in minutes." />
        <div className="relative mt-16 grid items-stretch gap-6 lg:grid-cols-3 lg:gap-7">
          <div className="flow-line absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-transparent via-[#173c2b]/22 to-transparent lg:block" />
          {productMoments.map(({ kicker, title, copy, image, icon: Icon }, index) => (
            <Reveal key={title} delay={index * REVEAL.stagger} className="h-full">
            <article
              className="story-tile group relative h-full min-h-[420px] overflow-hidden rounded-xl border border-white/10 bg-[#10241a] p-7 text-white"
            >
              <div className="absolute inset-0 opacity-30 transition duration-500 group-hover:scale-110 group-hover:opacity-50">
                <Image src={image} alt={`${kicker} step illustration`} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#10241a] via-[#10241a]/74 to-transparent" />
              <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 group-hover:shadow-[inset_0_0_0_1px_rgba(215,255,104,0.34)]" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/46">Step {String(index + 1).padStart(2, "0")}</p>
                    <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b5651d]">{kicker}</p>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/12 bg-white/10 transition group-hover:bg-[#b5651d] group-hover:text-[#10241a]">
                    <Icon size={22} weight="duotone" />
                  </span>
                </div>
                <div>
                  <h3 className="display-heading text-[28px] font-semibold leading-tight">{title}</h3>
                  <p className="mt-4 text-[14px] leading-6 text-white/72">{copy}</p>
                  <div className="mt-6 h-1.5 rounded-full bg-white/12">
                    <div className="bar-grow h-full rounded-full bg-[#b5651d]" style={{ width: `${52 + index * 18}%` }} />
                  </div>
                </div>
              </div>
            </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImmersiveProduct() {
  return (
    <section className="overflow-hidden bg-[#10241a] px-5 py-24 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.84fr_1.16fr]">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#b5651d]">Command center</p>
            <h2 className="display-heading mt-4 text-[48px] font-semibold leading-[0.98] md:text-[64px]">
              One screen explains the whole day.
            </h2>
            <p className="mt-6 text-[17px] leading-8 text-white/70">
              See what you ate, what is left, and what meal would fit next without jumping between disconnected tools.
            </p>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {["Meal verification", "Daily macro dashboard", "Coach context", "Weight trends", "Challenges", "Weekly digest"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-semibold transition hover:bg-white/8">
                  <Check size={16} weight="bold" className="text-[#b5651d]" />
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.055] p-4 shadow-[0_45px_130px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="spin-ring pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#b5651d]/12 blur-[90px]" />
            <div className="relative z-10 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-xl border border-white/18 bg-white p-5 text-[#10241a] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5f675f]">Lunch verified • 2:14 PM</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f7e5] px-2.5 py-1 text-[11px] font-bold text-[#166534]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                    Live
                  </span>
                </div>
                <p className="mt-3 text-[26px] font-semibold">Chicken rice bowl</p>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {["640", "38g", "74g", "21g"].map((v, i) => (
                    <div key={v} className="rounded-md bg-[#f2f5f1] p-3">
                      <p className="font-semibold">{v}</p>
                      <p className="text-[11px] text-[#5f675f]">{["kcal", "prot", "carb", "fat"][i]}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-lg bg-[#10241a] p-4 text-white">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-white/58">Daily calories</span>
                    <span className="font-semibold text-[#b5651d]">1,840 / 2,150</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/14">
                    <div className="bar-grow h-full w-[86%] rounded-full bg-[#b5651d]" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="float-soft-delayed rounded-xl border border-white/16 bg-[#b5651d] p-5 text-[#f6f1e7] shadow-[0_28px_80px_rgba(0,0,0,0.26)]">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">Cuckoo recommendation • just now</p>
                  <p className="mt-2 text-[24px] font-semibold">Make dinner protein-led.</p>
                  <p className="mt-4 text-[14px] leading-6 opacity-90">You have enough carbs today. Add lean protein and vegetables, keep oils light.</p>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {["chicken", "eggs", "tofu"].map((item) => (
                      <span key={item} className="rounded-full bg-black/15 px-3 py-1.5 text-center text-[12px] font-bold uppercase tracking-[0.08em]">{item}</span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative min-h-[180px] overflow-hidden rounded-xl border-[8px] border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.26)]">
                    <Image src={mealImage} alt="Vegetable salad bowl" fill sizes="220px" className="object-cover" />
                  </div>
                  <div className="rounded-xl border border-white/16 bg-white/12 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#b5651d]">Weight trend • weekly digest</p>
                    <p className="mt-2 text-[30px] font-semibold">-1.8 kg</p>
                    <div className="mt-4 flex h-16 items-end gap-1.5">
                      {[34, 46, 38, 58, 52, 72, 64].map((height, index) => (
                        <span key={index} className="w-full rounded-t bg-white/22" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                    <p className="mt-3 text-[13px] text-white/64">Logged across 21 days.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-4 rounded-xl border border-white/12 bg-[#10241a]/72 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/44">Notification</p>
              <p className="mt-2 text-[14px] font-semibold">Protein gap: 24g remaining • dinner suggestion ready</p>
            </div>
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DailyLoop() {
  return (
    <section id="loop" className="border-y border-black/10 bg-white px-5 py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#b5651d]">Daily routine</p>
            <h2 className="display-heading mt-4 max-w-xl text-[48px] font-semibold leading-[0.98] md:text-[52px]">
              A simple loop that brings people back.
            </h2>
            <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#5f675f]">
              Every saved meal creates momentum: a clearer target, a smarter coach response, and one more reason to keep the streak alive tomorrow.
            </p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                ["Streaks", "keep momentum"],
                ["Daily targets", "stay visible"],
                ["Challenges", "build the habit"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-black/8 bg-[#f8f8f3] p-4">
                  <p className="text-[20px] font-semibold leading-tight text-[#173c2b]">{value}</p>
                  <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[#5f675f]">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:h-full">
          <div className="relative min-h-[520px] overflow-hidden rounded-xl bg-[#eef5f2] p-5 lg:h-full">
            <Image
              src={mealImage}
              alt="Healthy vegetables and grains"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="absolute inset-0 object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#eef5f2] via-[#eef5f2]/90 to-[#eef5f2]/40" />
            <div className="relative z-10 grid h-full items-stretch gap-5 md:grid-cols-2">
              {[
                ["08:15", "Breakfast scanned", "Oats, banana, honey", "410 kcal", "Morning win"],
                ["13:05", "Lunch verified", "Chicken bowl adjusted", "640 kcal", "Logged fast"],
                ["17:40", "Coach check-in", "Protein short by 24g", "Next meal", "Still on track"],
                ["21:10", "Day closed", "86% calorie target", "Streak saved", "7-day badge"],
              ].map(([time, title, body, tag, badge]) => (
                <div key={title} className="routine-card flex h-full flex-col rounded-xl border border-black/8 bg-white/82 p-5 shadow-[0_18px_50px_rgba(16,21,16,0.08)] backdrop-blur-lg">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#b5651d]" />
                    <p className="font-mono text-[12px] font-semibold text-[#b5651d]">{time}</p>
                  </div>
                  <h3 className="mt-3 text-[20px] font-semibold">{title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#5f675f]">{body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-[#b5651d] px-3 py-1 text-[12px] font-bold text-[#10241a]">{tag}</span>
                    <span className="inline-flex rounded-full bg-[#eef5f2] px-3 py-1 text-[12px] font-bold text-[#173c2b]">{badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Personalization() {
  return (
    <section id="personal" className="px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr]">
        <Reveal className="lg:h-full">
        <div className="relative h-full min-h-[560px] overflow-hidden rounded-xl bg-[#173c2b] text-white">
          <Image
            src={phoneImage}
            alt="Ingredients for a personalized meal plan"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="absolute inset-0 object-cover opacity-34"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,60,43,0.20),rgba(23,60,43,0.96))]" />
          <div className="relative z-10 flex h-full min-h-[560px] flex-col justify-end p-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#b5651d]">Personal profile</p>
            <h2 className="display-heading mt-4 text-[48px] font-semibold leading-[0.98]">
              Recommendations match the person eating.
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-7 text-white/72">
              myNutriAI uses goals, body profile, allergies, preferences, budget, activity, timezone, and weight history to make personalization visible.
            </p>
          </div>
        </div>
        </Reveal>
        <div>
          <Header eyebrow="Personal context" title="Specific advice beats generic diet content." />
          <Reveal delay={0.1} className="mt-10 space-y-4">
            <div className="rounded-xl border border-black/8 bg-white p-5 shadow-[0_18px_50px_rgba(16,21,16,0.06)]">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#b5651d]">Goal profile</p>
                <span className="rounded-full bg-[#eef5f2] px-3 py-1 text-[12px] font-bold text-[#173c2b]">Fat loss</span>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  ["Calories", "2,150 kcal", "72%"],
                  ["Protein focus", "150g/day", "84%"],
                  ["Cooking time", "20 min", "46%"],
                ].map(([label, value, width]) => (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-[13px] font-semibold">
                      <span>{label}</span>
                      <span className="text-[#5f675f]">{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#eef5f2]">
                      <div className="bar-grow h-full rounded-full bg-[#173c2b]" style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid items-stretch gap-4 sm:grid-cols-2">
              <div className="h-full rounded-xl border border-black/8 bg-white p-5">
                <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#5f675f]">Preferences</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Vegetarian", "No peanuts", "Budget meals", "Home cooking"].map((item) => (
                    <span key={item} className="rounded-full bg-[#eef5f2] px-3 py-1.5 text-[12px] font-bold text-[#173c2b]">{item}</span>
                  ))}
                </div>
              </div>
              <div className="h-full rounded-xl border border-[#b5651d]/60 bg-[#10241a] p-5 text-white shadow-[0_18px_50px_rgba(16,21,16,0.12)]">
                <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#b5651d]">AI preview</p>
                <p className="mt-3 text-[22px] font-semibold">Protein low today.</p>
                <p className="mt-3 text-[14px] leading-6 text-white/70">Suggested dinner: grilled chicken with greens and rice.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [loading, setLoading] = useState<PaidPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (planId: PaidPlanId) => {
    setLoading(planId);
    setError(null);
    const result = await startCheckout(planId, { onUnauthorizedRedirectTo: "/pricing" });
    if (result.status === "error") {
      setError(result.message);
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="border-t border-black/10 bg-[#f1f5ef] px-5 py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Header eyebrow="Pricing" title="Simple plans that match the product today." />
        <div className="mt-6 flex max-w-3xl flex-wrap gap-3 text-[13px] font-bold text-[#173c2b]">
          {["No card required on Free", "Cancel anytime", "Upgrade only when the habit sticks"].map((item) => (
            <span key={item} className="rounded-full border border-black/8 bg-white px-4 py-2 shadow-[0_8px_24px_rgba(16,21,16,0.05)]">{item}</span>
          ))}
        </div>
        {error && (
          <div className="mt-8 rounded-lg border border-[#b7791f]/25 bg-white px-4 py-3 text-[14px] font-semibold text-[#8a5514]">
            {error}
          </div>
        )}
        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map(({ id, name, price, cadence, subtitle, features, featured, cta }, index) => (
            <Reveal key={name} delay={index * REVEAL.stagger} className="h-full">
            <div className={`pricing-tile relative flex h-full flex-col rounded-xl border p-7 ${featured ? "border-[#b5651d]/70 bg-[#10241a] text-white shadow-[0_38px_100px_rgba(16,21,16,0.34),0_0_70px_rgba(215,255,104,0.16)]" : "border-black/10 bg-white"}`}>
              {featured && <span className="absolute -top-3 left-6 rounded-full bg-[#b5651d] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#10241a]">Most popular</span>}
              <p className="text-[18px] font-semibold">{name}</p>
              <p className={featured ? "mt-2 text-[14px] text-white/62" : "mt-2 text-[14px] text-[#5f675f]"}>{subtitle}</p>
              {featured && <p className="mt-5 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-[12px] font-bold text-[#b5651d]">Best for consistent meal logging and Coach Cuckoo.</p>}
              <p className="mt-8 flex items-baseline gap-1">
                <span className="text-[48px] font-semibold leading-none">{price}</span>
                <span className={featured ? "text-[14px] font-semibold text-white/58" : "text-[14px] font-semibold text-[#5f675f]"}>{cadence}</span>
              </p>
              <ul className="mt-8 space-y-3">
                {features.map((item) => (
                  <li key={item} className="flex gap-2 text-[14px]">
                    <Check size={16} weight="bold" className={featured ? "mt-0.5 text-[#b5651d]" : "mt-0.5 text-[#b5651d]"} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex-1" />
              {id === "free" ? (
                <Link
                  href="/signup"
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 ${featured ? "bg-[#b5651d] text-[#f6f1e7] hover:bg-[#a5571a]" : "bg-[#10241a] text-white hover:bg-[#173c2b]"}`}
                >
                  {cta}
                  <ArrowRight size={14} weight="bold" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => { if (isPaidPlanId(id)) handleCheckout(id); }}
                  disabled={loading !== null}
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${featured ? "bg-[#b5651d] text-[#f6f1e7] hover:bg-[#a5571a]" : "bg-[#10241a] text-white hover:bg-[#173c2b]"}`}
                >
                  {loading === id ? "Redirecting..." : cta}
                  {loading !== id && <ArrowRight size={14} weight="bold" />}
                </button>
              )}
            </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-black/8 bg-white p-5 shadow-[0_16px_46px_rgba(16,21,16,0.06)]">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#b5651d]">Decision helper</p>
            <p className="mt-3 text-[18px] font-semibold text-[#173c2b]">Start free if you only need logging. Choose Pro when recommendations and unlimited scans become part of the routine.</p>
          </div>
          <div className="rounded-xl border border-black/8 bg-[#b5651d] p-5 text-[#f6f1e7] shadow-[0_16px_46px_rgba(16,21,16,0.08)]">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">The promise</p>
            <p className="mt-3 text-[20px] font-semibold leading-snug">Snap or type the meal, review the estimate, and save it. No searching a database or logging every ingredient by hand.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SeoHub() {
  const remainingPages = seoPages.filter(
    (page) => !["ai-meal-scanner", "indian-meal-calorie-tracker", "us-meal-calorie-tracker"].includes(page.slug)
  );

  return (
    <section className="border-t border-black/10 bg-[#f8f8f3] px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#b5651d]">Related guides</p>
          <h2 className="mt-4 text-[36px] font-semibold leading-tight text-[#173c2b] md:text-[44px]">
            Practical guides for real meal tracking.
          </h2>
          <p className="mt-5 text-[16px] leading-7 text-[#5f675f]">
            Explore calorie and macro tracking guides for the meals you actually eat.
          </p>
        </div>
        <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-3">
          {featuredSeoPages.map((page, index) => (
            <Reveal key={page.slug} delay={index * REVEAL.stagger} className="h-full">
            <Link
              href={`/${page.slug}`}
              className="group flex h-full flex-col rounded-lg border border-black/10 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#173c2b]/30 hover:shadow-[0_16px_42px_rgba(16,21,16,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f8f3]"
            >
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#b5651d]">{page.eyebrow}</p>
              <h3 className="mt-3 text-[21px] font-bold leading-tight text-[#173c2b]">{page.primaryKeyword}</h3>
              <p className="mt-3 text-[14px] leading-6 text-[#5f675f]">{page.description}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[14px] font-bold text-[#10241a]">
                Read guide
                <ArrowRight size={14} weight="bold" className="transition group-hover:translate-x-1" />
              </span>
            </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {remainingPages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group flex items-center gap-3 rounded-lg border border-black/8 bg-white px-4 py-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-[#173c2b]/30 hover:shadow-[0_8px_24px_rgba(16,21,16,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f8f3]"
            >
              <span className="shrink-0 grid h-8 w-8 place-items-center rounded-md bg-[#eef5f2] text-[#173c2b] transition group-hover:bg-[#b5651d] group-hover:text-[#10241a]">
                <ForkKnife size={14} weight="bold" />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-[#173c2b]">{page.primaryKeyword}</span>
                <span className="block text-[12px] text-[#5f675f]">{page.eyebrow}</span>
              </span>
              <ArrowRight size={12} weight="bold" className="ml-auto shrink-0 text-[#5f675f] transition group-hover:translate-x-0.5 group-hover:text-[#173c2b]" />
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-5 py-2.5 text-[14px] font-semibold text-[#173c2b] transition duration-200 hover:-translate-y-0.5 hover:border-[#173c2b]/30 hover:shadow-[0_8px_24px_rgba(16,21,16,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f8f3]"
          >
            View all guides
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="border-t border-black/10 bg-[#f8f8f3] px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Header eyebrow="FAQ" title="Questions users ask before trusting a nutrition app." />
          <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#5f675f]">
            Clear answers for editable scans, personal context, privacy, and day-by-day habit building.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map(({ question, answer }, index) => (
            <Reveal key={question} delay={Math.min(index, 3) * 0.04}>
            <div
              className={`faq-item rounded-xl border bg-white p-6 shadow-[0_12px_36px_rgba(16,21,16,0.04)] ${openIndex === index ? "border-[#173c2b]/22" : "border-black/8"}`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="flex w-full items-center justify-between gap-5 rounded-lg text-left text-[17px] font-semibold leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <span>{question}</span>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#173c2b] transition-[transform,background-color,color] ${openIndex === index ? "rotate-180 bg-[#b5651d] text-[#10241a]" : "bg-[#eef5f2]"}`}>
                  <CaretDown size={16} weight="bold" />
                </span>
              </button>
              <div className={`faq-panel grid transition-[grid-template-rows,opacity] duration-300 ease-out ${openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="mt-4 max-w-3xl border-t border-black/6 pt-4 text-[15px] leading-7 text-[#5f675f]">{answer}</p>
                </div>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Final() {
  return (
    <footer className="relative overflow-hidden bg-[#10241a] px-5 py-24 text-[#f6f1e7] lg:px-8 lg:py-28">
      <div className="absolute right-[-90px] top-[-120px] h-[360px] w-[360px] rounded-full border-[50px] border-[#b5651d]/15" />
      <div className="absolute bottom-[-80px] left-[-60px] h-[260px] w-[260px] rounded-full border-[40px] border-[#b5651d]/10" />
      <div className="relative mx-auto max-w-7xl">
        <Reveal>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] opacity-70">myNutriAI</p>
            <h2 className="display-heading mt-4 max-w-3xl text-[50px] font-semibold leading-[0.98] md:text-[54px]">
              Turn the next meal into the next right decision.
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-7 opacity-70">Start tracking meals with myNutriAI, get coached by Cuckoo, and build a nutrition habit that lasts.</p>
          </div>
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b5651d] px-8 py-4 text-[15px] font-semibold text-[#f6f1e7] shadow-[0_16px_40px_rgba(16,21,16,0.28)] transition hover:bg-[#a5571a] hover:shadow-[0_20px_50px_rgba(16,21,16,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10241a]">
            Log your first meal
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
        </Reveal>
        <div className="mt-14 flex flex-col gap-4 border-t border-[#f6f1e7]/15 pt-6 text-[13px] font-semibold opacity-70 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 myNutriAI. AI-powered nutrition tracking for real meals.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="transition hover:opacity-100 hover:underline">Terms</Link>
            <Link href="/privacy" className="transition hover:opacity-100 hover:underline">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal className="max-w-4xl">
      <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#b5651d]">{eyebrow}</p>
      <h2 className="display-heading mt-4 text-[44px] font-semibold leading-[1] md:text-[60px]">{title}</h2>
    </Reveal>
  );
}
