"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BellRinging,
  Camera,
  CaretDown,
  ChartLineUp,
  ChatCircleText,
  Check,
  ForkKnife,
  ShieldCheck,
  Sparkle,
  Target,
} from "@phosphor-icons/react/dist/ssr";

const heroImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=2400&q=90";

const mealImage =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=90";

const phoneImage =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=90";

const proof = [
  {
    title: "Scan or type any meal",
    body: "Image and text analysis turns food into editable calories, protein, carbs, fat, and meal items.",
    icon: Camera,
  },
  {
    title: "Know the next meal",
    body: "Coach Ria and recommendations use the user's day, goals, preferences, and remaining targets.",
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
    title: "A photo becomes a meal you can trust.",
    copy: "NutriAI should feel useful the second the camera opens: itemized food, confidence, editable portions, and a clear save action.",
    image: heroImage,
    icon: Camera,
  },
  {
    kicker: "Daily intelligence",
    title: "The dashboard tells users what is still missing.",
    copy: "The customer does not only need today's calories. They need the gap: protein short, carbs high, dinner should be lighter.",
    image: phoneImage,
    icon: Target,
  },
  {
    kicker: "Long-term progress",
    title: "Meals, weight, challenges, and digests become one loop.",
    copy: "Analytics, history, weight tracking, challenges, and emails make the product feel like a system instead of a one-time scanner.",
    image: mealImage,
    icon: BellRinging,
  },
];

const personalization = [
  "Goal and calorie targets",
  "Activity level and body profile",
  "Allergies and preferences",
  "Budget and cooking time",
  "Timezone-aware reminders",
  "Weight trend history",
];

const faqs = [
  {
    question: "Can NutriAI handle Indian meals and mixed plates?",
    answer:
      "Yes. The scanner is designed for mixed meals like dal rice, paneer bowls, wraps, salads, and restaurant plates, then lets the user edit portions before saving.",
  },
  {
    question: "What happens if the food analysis is wrong?",
    answer:
      "Users can adjust food items, serving size, and macros before confirming. The product experience should make correction feel quick instead of punishing.",
  },
  {
    question: "Does the coach use my daily targets?",
    answer:
      "Yes. Coach Ria reads the user's saved meals, calorie target, macro gaps, preferences, allergies, and goal context before suggesting the next meal.",
  },
  {
    question: "Is this only a calorie tracker?",
    answer:
      "No. Calories are the base layer, but the value is the loop: recommendations, weight trends, challenges, streaks, history, and weekly digests.",
  },
  {
    question: "Can I use NutriAI without uploading photos?",
    answer:
      "Yes. Users can type meals manually, use recommendations, track weight, view analytics, and still get coaching from saved context.",
  },
  {
    question: "What privacy signals does the app support?",
    answer:
      "The product already has verified accounts, private uploads, auth roles, account controls, and measured handling for profile and weight data.",
  },
];

const pricing: Array<{
  name: string;
  price: string;
  subtitle: string;
  featured?: boolean;
  items: string[];
}> = [
  {
    name: "Free",
    price: "$0",
    subtitle: "For the first meal habit",
    items: ["Meal logging", "Daily macro targets", "Limited food analysis", "Saved meal history"],
  },
  {
    name: "Pro",
    price: "$9",
    subtitle: "For daily coaching",
    featured: true,
    items: ["Unlimited analysis", "Coach Ria", "Meal recommendations", "Weight tracking", "Challenges", "Weekly digest"],
  },
  {
    name: "Platform",
    price: "Talk",
    subtitle: "For future API or team use",
    items: ["API keys", "Usage tracking", "Admin overview", "Role-based access"],
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8f8f3] text-[#101510]">
      <ScrollProgress />
      <Nav />
      <Hero />
      <ProofStrip />
      <ProductMoments />
      <ImmersiveProduct />
      <DailyLoop />
      <Personalization />
      <PlatformProof />
      <Pricing />
      <FAQ />
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
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent">
      <div
        className="h-full bg-[#d7ff68] shadow-[0_0_20px_rgba(215,255,104,0.55)]"
        style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
      />
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#070d09]/85 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#d7ff68] text-[#101510]">
            <ForkKnife size={17} weight="bold" />
          </span>
          NutriAI
        </Link>
        <nav className="hidden items-center gap-7 text-[14px] font-medium text-white/60 md:flex">
          <a href="#product" className="transition hover:text-white">Features</a>
          <a href="#loop" className="transition hover:text-white">How it works</a>
          <a href="#personal" className="transition hover:text-white">Developers</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
          <a href="#faq" className="transition hover:text-white">Changelog</a>
        </nav>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/9 px-4 py-2 text-[14px] font-semibold backdrop-blur-md transition hover:bg-white hover:text-[#101510]"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#070d09] text-white">
      {/* Atmospheric background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-[#173c2b]/40 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[600px] rounded-full bg-[#0f8b8d]/10 blur-[120px]" />
        <div className="absolute -bottom-10 left-1/4 h-[350px] w-[500px] rounded-full bg-[#d7ff68]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen max-w-7xl px-5 pb-16 pt-28 lg:px-8">
        <div className="grid min-h-[calc(100vh-7rem)] items-center gap-12 lg:grid-cols-[55%_45%]">

          {/* Left: text content */}
          <div>
            <div className="hero-reveal mb-8 inline-flex items-center gap-2.5 rounded-full border border-[rgba(215,255,104,0.22)] bg-[rgba(215,255,104,0.07)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[rgba(215,255,104,0.90)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d7ff68]" />
              AI Nutrition, Ready for Production
            </div>

            <h1 className="hero-reveal hero-delay-1 text-[58px] font-bold leading-[1.02] tracking-[-0.02em] md:text-[78px] lg:text-[88px]">
              Eat with{" "}
              <span
                className="text-[#d7ff68]"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 700 }}
              >
                clarity.
              </span>
              <br />
              Ship with{" "}
              <span
                className="text-[#d7ff68]"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 700 }}
              >
                confidence.
              </span>
            </h1>

            <p className="hero-reveal hero-delay-2 mt-7 max-w-[500px] text-[17px] leading-[1.85] text-white/52">
              NutriAI turns a photo or a line of text into calories, macros, and a plan that adapts to you — wrapped in a developer-ready API you can drop into any product.
            </p>

            <div className="hero-reveal hero-delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-[#d7ff68] px-7 py-4 text-[15px] font-bold text-[#101510] shadow-[0_0_50px_rgba(215,255,104,0.20)] transition hover:bg-white"
              >
                Start free — 14-day Pro trial
              </Link>
              <a
                href="#product"
                className="inline-flex items-center gap-1.5 px-3 py-4 text-[15px] font-semibold text-white/55 transition hover:text-white"
              >
                Read the docs
                <ArrowRight size={14} weight="bold" />
              </a>
            </div>

            <div className="hero-reveal hero-delay-3 mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/38">
              {["No credit card", "Free forever tier", "SOC 2 ready"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check size={12} weight="bold" className="text-[#d7ff68]/60" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: phone mockup stage */}
          <div className="hero-reveal hero-delay-2 hidden justify-center lg:flex">
            <HeroPhoneStage />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPhoneStage() {
  return (
    <div className="relative" style={{ width: 420, height: 640 }}>
      {/* Query bubble — top left */}
      <div className="absolute left-0 top-0 z-20 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/9 px-4 py-2.5 shadow-lg backdrop-blur-xl">
        <span className="text-base text-[#d7ff68]/80">☆</span>
        <span className="text-[12px] font-semibold text-white">What&apos;s my protein left today?</span>
      </div>

      {/* Phone frame */}
      <div
        className="absolute z-10 overflow-hidden rounded-[40px] border border-white/12 bg-[#0e1a10] shadow-[0_60px_120px_rgba(0,0,0,0.70),0_0_0_1px_rgba(255,255,255,0.04)]"
        style={{ width: 248, height: 524, top: 56, left: 86 }}
      >
        {/* Dynamic island */}
        <div className="absolute left-1/2 top-3.5 z-20 h-7 w-[84px] -translate-x-1/2 rounded-full bg-black" />
        {/* Status bar spacer */}
        <div className="h-[52px]" />
        {/* Meal photo */}
        <div className="relative">
          <img src={mealImage} alt="Meal" className="h-[132px] w-full object-cover" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-[#173c2b]/92 px-2.5 py-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d7ff68]" />
            <span className="text-[8px] font-bold text-white">ANALYZING</span>
          </div>
          <div className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-0.5 shadow-sm">
            <span className="text-[8px] font-bold text-[#173c2b]">98% match</span>
          </div>
        </div>
        {/* Meal info */}
        <div className="bg-[#f5f8f5] px-3.5 pt-3">
          <p className="text-[10px] font-semibold leading-tight text-[#3a4a3a]">
            Grain bowl with salmon, roasted carrots &amp; greens
          </p>
          <p className="mt-0.5 text-[9px] text-[#8fa48f]">486 kcal · logged to lunch</p>
          <div className="mt-2.5 grid grid-cols-4 gap-1">
            {[["34g", "PROTEIN"], ["42g", "CARBS"], ["18g", "FAT"], ["7g", "FIBER"]].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-white p-1.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.07)]">
                <p className="text-[11px] font-bold text-[#101510]">{v}</p>
                <p className="mt-0.5 text-[6.5px] font-semibold text-[#9fa89f]">{l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mx-3.5 mt-2.5 rounded-lg bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.07)]">
          <div className="flex justify-between text-[9px]">
            <span className="text-[#8fa48f]">Daily calories</span>
            <span className="font-bold text-[#3a4a3a]">1,462 / 2,150</span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-[#eef2ee]">
            <div className="h-full w-[68%] rounded-full bg-[#173c2b]" />
          </div>
          <div className="mt-1.5 flex justify-end">
            <span className="text-[8px] font-semibold text-[#173c2b]">TARGET 2,150</span>
          </div>
        </div>
        {/* CTA inside phone */}
        <div className="mx-3.5 mt-2 rounded-xl bg-[#173c2b] py-2.5 text-center">
          <span className="text-[10px] font-bold text-[#d7ff68]">Plan my next week →</span>
        </div>
      </div>

      {/* Notification — top right */}
      <div className="absolute right-0 top-[72px] z-20 flex items-center gap-2 rounded-xl border border-white/14 bg-white/9 px-3 py-2 backdrop-blur-xl">
        <BellRinging size={11} weight="fill" className="text-[#d7ff68]" />
        <span className="text-[11px] font-semibold text-white">High-protein breakfast idea</span>
      </div>

      {/* Coach Ria card — right */}
      <div className="float-slow absolute right-0 top-[210px] z-20 w-[158px] rounded-2xl border border-black/8 bg-white p-3 shadow-[0_16px_48px_rgba(0,0,0,0.20)]">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#173c2b]">
            <Sparkle size={13} weight="fill" className="text-[#d7ff68]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#101510]">Coach Ria</p>
            <p className="text-[7px] font-semibold uppercase tracking-wide text-[#9fa89f]">AI Nutritionist</p>
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-[1.55] text-[#5f675f]">
          You&apos;re 42g short on protein. A chicken breast at dinner will close it.
        </p>
      </div>

      {/* "How was my week?" — left mid */}
      <div className="absolute left-0 top-[338px] z-20 rounded-xl border border-white/14 bg-white/9 px-3.5 py-2.5 backdrop-blur-xl">
        <span className="text-[11px] font-semibold text-white">How was my week?</span>
      </div>

      {/* Streak card — bottom left */}
      <div className="float-fast absolute bottom-4 left-2 z-20 rounded-2xl bg-[#d7ff68] p-4 shadow-[0_16px_40px_rgba(215,255,104,0.28)]">
        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#101510]/55">Streak</p>
        <p className="mt-0.5 text-[36px] font-bold leading-none text-[#101510]">12</p>
        <p className="text-[9px] font-semibold text-[#101510]/55">days in a row</p>
        <div className="mt-2.5 flex gap-0.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className={`block h-[3px] flex-1 rounded-full ${i < 5 ? "bg-[#101510]/35" : "bg-[#101510]/12"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProofStrip() {
  return (
    <section className="relative z-10 -mt-12 px-5 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-2 rounded-lg border border-black/10 bg-white p-3 shadow-[0_24px_70px_rgba(16,21,16,0.14)] md:grid-cols-4">
        {proof.map(({ title, body, icon: Icon }) => (
          <div key={title} className="rounded-lg p-4 transition hover:bg-[#f0f6ef]">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-[#eef5f2] text-[#173c2b]">
              <Icon size={20} weight="duotone" />
            </div>
            <p className="text-[14px] font-semibold">{title}</p>
            <p className="mt-2 text-[13px] leading-5 text-[#5f675f]">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductMoments() {
  return (
    <section id="product" className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Header eyebrow="Product proof" title="The landing page should feel like using the app." />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {productMoments.map(({ kicker, title, copy, image, icon: Icon }) => (
            <article key={title} className="story-tile group relative min-h-[380px] overflow-hidden rounded-lg border border-black/10 bg-[#101510] p-6 text-white">
              <div className="absolute inset-0 opacity-34 transition group-hover:scale-105 group-hover:opacity-48">
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#101510] via-[#101510]/70 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#d7ff68]">{kicker}</p>
                  <Icon size={22} weight="duotone" />
                </div>
                <div>
                  <h3 className="display-heading text-[28px] font-semibold leading-tight">{title}</h3>
                  <p className="mt-4 text-[14px] leading-6 text-white/72">{copy}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImmersiveProduct() {
  return (
    <section className="overflow-hidden bg-[#101510] px-5 py-24 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.84fr_1.16fr]">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#d7ff68]">Command center</p>
            <h2 className="display-heading mt-4 text-[48px] font-semibold leading-[0.98] md:text-[64px]">
              One screen should explain the whole day.
            </h2>
            <p className="mt-6 text-[17px] leading-8 text-white/70">
              A customer wants an answer fast: what happened, what is left, and what should I eat next? This visual ties the backend features into one paid-product experience.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Meal verification", "Daily macro dashboard", "Coach context", "Weight trends", "Challenges", "Weekly digest"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[14px] font-semibold">
                  <Check size={16} weight="bold" className="text-[#d7ff68]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[650px]">
            <div className="spin-ring absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="absolute left-0 top-20 w-[430px] rotate-[-4deg] rounded-lg border border-white/16 bg-white p-5 text-[#101510] shadow-[0_35px_90px_rgba(0,0,0,0.32)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5f675f]">Saved meal</p>
              <h3 className="mt-2 text-[26px] font-semibold">Paneer rice bowl</h3>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {["640", "38g", "74g", "21g"].map((v, i) => (
                  <div key={v} className="rounded-md bg-[#f2f5f1] p-3">
                    <p className="font-semibold">{v}</p>
                    <p className="text-[11px] text-[#5f675f]">{["kcal", "prot", "carb", "fat"][i]}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-16 right-0 w-[430px] rotate-[3deg] rounded-lg border border-white/16 bg-[#d7ff68] p-5 text-[#101510] shadow-[0_35px_90px_rgba(0,0,0,0.32)]">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">Next action</p>
              <h3 className="mt-2 text-[26px] font-semibold">Dinner should be protein-led.</h3>
              <p className="mt-4 text-[14px] leading-6 opacity-76">You have enough carbs today. Add lean protein and vegetables, keep oils light.</p>
            </div>
            <div className="absolute right-24 top-0 h-[220px] w-[220px] overflow-hidden rounded-full border-[10px] border-white/10 shadow-[0_35px_90px_rgba(0,0,0,0.32)]">
              <img src={mealImage} alt="Vegetable salad bowl" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-24 w-[280px] rounded-lg border border-white/16 bg-white/12 p-5 backdrop-blur-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#d7ff68]">Weight trend</p>
              <p className="mt-2 text-[30px] font-semibold">-1.8 kg</p>
              <p className="mt-1 text-[13px] text-white/64">Logged across 21 days with weekly digest.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DailyLoop() {
  return (
    <section id="loop" className="border-y border-black/10 bg-white px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0f8b8d]">Daily routine</p>
            <h2 className="display-heading mt-4 max-w-xl text-[48px] font-semibold leading-[0.98] md:text-[52px]">
              The best feature is the loop that brings people back.
            </h2>
            <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#5f675f]">
              NutriAI becomes more valuable after every saved meal because the coach, analytics, recommendations, challenges, and digests get more context.
            </p>
          </div>
          <div className="relative min-h-[520px] overflow-hidden rounded-lg bg-[#eef5f2] p-5">
            <img src={mealImage} alt="Healthy vegetables and grains" className="absolute inset-0 h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#eef5f2] via-[#eef5f2]/90 to-[#eef5f2]/40" />
            <div className="relative z-10 grid h-full gap-4 md:grid-cols-2">
              {[
                ["08:15", "Breakfast scanned", "Oats, banana, honey", "410 kcal"],
                ["13:05", "Lunch verified", "Paneer bowl adjusted", "640 kcal"],
                ["17:40", "Coach check-in", "Protein short by 24g", "Next meal"],
                ["21:10", "Day closed", "86% calorie target", "Streak saved"],
              ].map(([time, title, body, tag]) => (
                <div key={title} className="routine-card rounded-lg border border-black/10 bg-white/78 p-5 shadow-[0_18px_50px_rgba(16,21,16,0.08)] backdrop-blur-md">
                  <p className="font-mono text-[12px] text-[#0f8b8d]">{time}</p>
                  <h3 className="mt-4 text-[22px] font-semibold">{title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#5f675f]">{body}</p>
                  <span className="mt-5 inline-flex rounded-full bg-[#d7ff68] px-3 py-1 text-[12px] font-bold text-[#101510]">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Personalization() {
  return (
    <section id="personal" className="px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="relative min-h-[560px] overflow-hidden rounded-lg bg-[#173c2b] text-white">
          <img src={phoneImage} alt="Ingredients for a personalized meal plan" className="absolute inset-0 h-full w-full object-cover opacity-34" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,60,43,0.20),rgba(23,60,43,0.96))]" />
          <div className="relative z-10 flex min-h-[560px] flex-col justify-end p-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#d7ff68]">Personal profile</p>
            <h2 className="display-heading mt-4 text-[48px] font-semibold leading-[0.98]">
              Recommendations should feel made for one person.
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-7 text-white/72">
              The backend already captures goals, body profile, allergies, preferences, budget, activity, timezone, and weight history. The page should make that personalization visible.
            </p>
          </div>
        </div>
        <div>
          <Header eyebrow="Why it feels premium" title="Specific advice beats generic diet content." />
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {personalization.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-black/10 bg-white p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#eef5f2] text-[#173c2b]">
                  <Check size={16} weight="bold" />
                </span>
                <p className="text-[14px] font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-t border-black/10 bg-[#f1f5ef] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Header eyebrow="Pricing" title="Simple plans that match the product today." />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {pricing.map(({ name, price, subtitle, items, featured }) => (
            <div key={name} className={`pricing-tile rounded-lg border p-6 ${featured ? "border-[#101510] bg-[#101510] text-white" : "border-black/10 bg-white"}`}>
              <p className="text-[18px] font-semibold">{name}</p>
              <p className={featured ? "mt-2 text-[14px] text-white/62" : "mt-2 text-[14px] text-[#5f675f]"}>{subtitle}</p>
              <p className="mt-8 text-[48px] font-semibold">{price}</p>
              <ul className="mt-8 space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex gap-2 text-[14px]">
                    <Check size={16} weight="bold" className={featured ? "mt-0.5 text-[#d7ff68]" : "mt-0.5 text-[#0f8b8d]"} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformProof() {
  return (
    <section className="border-y border-black/10 bg-white px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <Header eyebrow="Platform depth" title="The app has product infrastructure behind the meal scanner." />
          <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#5f675f]">
            The paid-product signal is not another feature card. It is the operational layer: private uploads, API keys, metered public calls, role-based admin, usage cost, and cache visibility.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["Private image uploads", "API key management", "Public calories endpoint", "AI cost tracking", "Admin user operations", "Provider/cache telemetry"].map((item) => (
              <div key={item} className="rounded-lg border border-black/10 bg-[#f8f8f3] p-4">
                <p className="text-[14px] font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-[#101510] p-5 text-white shadow-[0_28px_90px_rgba(16,21,16,0.18)]">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["AI spend today", "$2.18", "1,105 requests"],
              ["Cache hit rate", "18%", "lower cost repeats"],
              ["Active API keys", "9", "scoped and revocable"],
              ["Failed calls", "2", "watchlist signal"],
            ].map(([label, value, sub]) => (
              <div key={label} className="rounded-lg border border-white/12 bg-white/10 p-4">
                <p className="text-[12px] font-semibold text-white/58">{label}</p>
                <p className="mt-2 text-[32px] font-semibold">{value}</p>
                <p className="mt-1 text-[12px] text-white/58">{sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-[#d7ff68] p-4 text-[#101510]">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">Admin activity</p>
            <p className="mt-2 text-[18px] font-semibold">Meal analysis completed · 640 kcal saved to today</p>
            <p className="mt-1 text-[13px] opacity-70">The operating layer should feel reliable without exposing internal system details.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="border-t border-black/10 bg-[#f8f8f3] px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Header eyebrow="FAQ" title="Questions users ask before trusting a nutrition app." />
          <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#5f675f]">
            These answers make the landing page feel closer to the actual product: editable scans, personal context, privacy, and day-by-day habit building.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map(({ question, answer }, index) => (
            <details
              key={question}
              className="faq-item group rounded-lg border border-black/10 bg-white p-5 shadow-[0_16px_42px_rgba(16,21,16,0.06)]"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-[18px] font-semibold">
                <span>{question}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#eef5f2] text-[#173c2b] transition group-open:rotate-180">
                  <CaretDown size={16} weight="bold" />
                </span>
              </summary>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#5f675f]">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Final() {
  return (
    <section className="relative overflow-hidden bg-[#d7ff68] px-5 py-24 text-[#101510] lg:px-8">
      <div className="absolute right-[-90px] top-[-120px] h-[360px] w-[360px] rounded-full border-[50px] border-[#101510]/10" />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] opacity-70">NutriAI</p>
          <h2 className="display-heading mt-4 max-w-3xl text-[50px] font-semibold leading-[0.98] md:text-[54px]">
            Turn the next meal into the next right decision.
          </h2>
        </div>
        <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#101510] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#173c2b]">
          Log your first meal
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </section>
  );
}

function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-4xl">
      <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0f8b8d]">{eyebrow}</p>
      <h2 className="display-heading mt-4 text-[44px] font-semibold leading-[1] md:text-[60px]">{title}</h2>
    </div>
  );
}
