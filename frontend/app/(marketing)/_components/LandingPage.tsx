"use client";

import Image from "next/image";
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
  Crosshair,
  ForkKnife,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { seoPages } from "../seoPages";
import { PublicMealEstimator } from "./PublicMealEstimator";

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
    question: "Can myNutriAI handle Indian meals and mixed plates?",
    answer:
      "Yes. The scanner is designed for mixed meals like dal rice, paneer bowls, wraps, salads, and restaurant plates, then lets the user edit portions before saving.",
  },
  {
    question: "What happens if the food analysis is wrong?",
    answer:
      "Users can adjust food items, serving size, and macros before confirming, so correction stays quick and low-friction.",
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
    question: "Can I use myNutriAI without uploading photos?",
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
  period: string;
  subtitle: string;
  featured?: boolean;
  cta: string;
  href: string;
  items: string[];
}> = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    subtitle: "For the first meal habit",
    cta: "Start free",
    href: "/signup",
    items: ["Meal logging", "Daily macro targets", "3 food analyses per day", "Saved meal history"],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    subtitle: "For daily coaching",
    featured: true,
    cta: "Start Pro",
    href: "/pricing",
    items: ["Unlimited analysis", "Coach Ria", "Meal recommendations", "Weight tracking", "Challenges", "Weekly digest"],
  },
  {
    name: "Pro Lifetime",
    price: "$79",
    period: "one-time",
    subtitle: "Pay once, use forever",
    cta: "Get lifetime",
    href: "/pricing",
    items: ["Everything in Pro", "Lifetime access", "All future features", "No recurring charges"],
  },
];

const featuredSeoPages = ["ai-meal-scanner", "indian-meal-calorie-tracker", "us-meal-calorie-tracker"]
  .map((slug) => seoPages.find((page) => page.slug === slug))
  .filter((page): page is (typeof seoPages)[number] => Boolean(page));

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8f8f3] text-[#101510]">
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#101510]/78 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#d7ff68] text-[#101510]">
            <ForkKnife size={17} weight="bold" />
          </span>
          myNutriAI
        </Link>
        <nav className="hidden items-center gap-8 text-[14px] font-medium text-white/76 md:flex">
          <a href="#estimate" className="hover:text-white">Try demo</a>
          <a href="#product" className="hover:text-white">Product</a>
          <a href="#loop" className="hover:text-white">Routine</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-[14px] font-semibold text-white/76 transition hover:text-white sm:inline-flex">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-[14px] font-semibold text-[#101510] transition hover:bg-[#d7ff68]"
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
    <section className="relative min-h-[100svh] overflow-hidden bg-[#101510] text-white">
      <Image
        src={heroImage}
        alt="Colorful nutrition bowl with grains and vegetables"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,21,16,0.96)_0%,rgba(16,21,16,0.82)_46%,rgba(16,21,16,0.28)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#101510] to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-8 px-5 pb-20 pt-24 sm:pb-24 sm:pt-28 lg:grid-cols-[0.82fr_1fr] lg:px-8 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="max-w-3xl">
          <div className="hero-reveal mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] backdrop-blur-md">
            <Sparkle size={14} weight="fill" className="text-[#d7ff68]" />
            AI meal scanner and macro tracker
          </div>
          <h1 className="hero-reveal hero-delay-1 display-heading max-w-4xl text-[44px] font-semibold leading-[0.98] md:text-[64px] xl:text-[80px]">
            Track real meals with an AI calorie scanner.
          </h1>
          <p className="hero-reveal hero-delay-2 mt-6 max-w-2xl text-[16px] leading-7 text-white/78 md:text-[18px] xl:mt-7 xl:text-[20px] xl:leading-8">
            Scan a food photo, review editable calories and macros, then see what fits your calorie and protein targets next.
          </p>
          <div className="hero-reveal hero-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#estimate" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d7ff68] px-6 py-3.5 text-[15px] font-bold text-[#101510] shadow-[0_18px_44px_rgba(215,255,104,0.22)] transition hover:bg-white">
              Try meal estimate
              <ArrowRight size={16} weight="bold" />
            </a>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/24 bg-white/10 px-6 py-3.5 text-[15px] font-bold text-white backdrop-blur-md transition hover:bg-white/16">
              Create account
            </Link>
          </div>

          <div className="hero-reveal hero-delay-3 mt-7 grid max-w-2xl gap-2 sm:grid-cols-3">
            {["Burrito bowls", "Dal rice and thalis", "Salads and sandwiches"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-white/14 bg-white/8 px-3 py-2.5 text-[12px] font-semibold text-white/78 backdrop-blur-md">
                <Check size={14} weight="bold" className="text-[#d7ff68]" />
                {item}
              </div>
            ))}
          </div>

          <div className="hero-reveal hero-delay-3 mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
            {[
              ["612", "kcal scan"],
              ["24g", "protein left"],
              ["7 day", "streak"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-white/16 bg-white/10 px-3 py-3 backdrop-blur-md">
                <p className="text-[22px] font-semibold">{value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/56">{label}</p>
              </div>
            ))}
          </div>

          <div className="hero-reveal hero-delay-3 mt-6 rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d7ff68]">Meal saved</p>
                <h2 className="mt-1 text-[20px] font-semibold">Greek bowl</h2>
              </div>
              <span className="rounded-full bg-[#d7ff68] px-3 py-1 text-[11px] font-bold text-[#101510]">92% sure</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ["612", "kcal"],
                ["42g", "pro"],
                ["58g", "carb"],
                ["19g", "fat"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-white/12 p-2">
                  <p className="text-[15px] font-bold">{value}</p>
                  <p className="text-[10px] font-semibold text-white/56">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-stage hidden lg:block lg:scale-[0.82] lg:-translate-x-4 xl:translate-x-0 xl:scale-100">
          <NutritionHUD />
          <FloatingPhone />
          <CoachBubble />
          <StreakCard />
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55 md:block">
        Try a meal estimate below
      </div>
    </section>
  );
}

function FloatingPhone() {
  return (
    <div className="float-slow absolute left-[210px] top-4 z-30 h-[560px] w-[286px] rounded-[42px] bg-[linear-gradient(145deg,#333b33,#080c08_42%,#1a211a)] p-[9px] shadow-[0_50px_120px_rgba(0,0,0,0.6),0_0_60px_rgba(215,255,104,0.08),0_0_0_1px_rgba(255,255,255,0.18)] xl:left-[260px]">
      <span className="absolute -left-1 top-24 h-14 w-1 rounded-l-full bg-white/24" />
      <span className="absolute -left-1 top-44 h-20 w-1 rounded-l-full bg-white/20" />
      <span className="absolute -right-1 top-36 h-24 w-1 rounded-r-full bg-black/45" />
      <div className="pointer-events-none absolute inset-[9px] z-20 rounded-[33px] bg-[linear-gradient(115deg,rgba(255,255,255,0.22),transparent_28%,transparent_68%,rgba(255,255,255,0.10))]" />

      <div className="relative h-full overflow-hidden rounded-[33px] bg-[#f8f8f3] text-[#101510]">
        <div className="absolute left-1/2 top-3 z-30 h-7 w-[92px] -translate-x-1/2 rounded-full bg-[#090d09] shadow-[inset_0_-1px_0_rgba(255,255,255,0.18)]" />
        <div className="absolute inset-x-0 top-0 z-20 flex h-12 items-center justify-between bg-[linear-gradient(180deg,rgba(16,21,16,0.72),rgba(16,21,16,0))] px-5 pt-2 text-[10px] font-bold text-white">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-4 rounded-full border border-white/80" />
            <span className="h-1.5 w-1 rounded-full bg-white/80" />
          </span>
        </div>

        <div className="relative h-[184px] overflow-hidden">
          <Image
            src={phoneImage}
            alt="Healthy meal ingredients"
            fill
            sizes="286px"
            className="object-cover saturate-[1.12] contrast-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.28))]" />
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-[10px] font-bold text-[#173c2b] shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16a34a]" />
            Analyzed
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-[18px] bg-white p-4 shadow-[0_14px_36px_rgba(16,21,16,0.10)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f796f]">Lunch analysis</p>
                <h3 className="mt-1 text-[20px] font-semibold leading-tight">Greek bowl</h3>
              </div>
              <span className="rounded-full bg-[#d7ff68] px-2.5 py-1 text-[10px] font-bold text-[#101510] shadow-[0_8px_18px_rgba(215,255,104,0.30)]">
                92% sure
              </span>
            </div>

            <div className="mt-4 rounded-[16px] bg-[#101510] p-3 text-white shadow-[0_16px_34px_rgba(16,21,16,0.18)]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-white/55">Estimated calories</p>
                  <p className="mt-0.5 text-[30px] font-semibold leading-none">612</p>
                </div>
                <p className="pb-1 text-[12px] font-semibold text-[#d7ff68]">kcal</p>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/16">
                <div className="h-full w-[68%] rounded-full bg-[#d7ff68] shadow-[0_0_18px_rgba(215,255,104,0.42)]" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["42g", "Protein"],
                ["58g", "Carbs"],
                ["19g", "Fat"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[14px] bg-[#f1f5ef] p-2.5 text-center">
                  <p className="text-[15px] font-semibold">{value}</p>
                  <p className="mt-0.5 text-[9px] font-semibold text-[#6f796f]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-[18px] bg-[#eef5f2] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-[#173c2b]">Saved to today</p>
              <Check size={15} weight="bold" className="text-[#16a34a]" />
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[#5f675f]">Dinner recommendation updated.</p>
          </div>

          <button className="mt-3 w-full rounded-[16px] bg-[#173c2b] py-3 text-[13px] font-semibold text-white shadow-[0_14px_28px_rgba(23,60,43,0.24)]">
            Confirm meal
          </button>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-[#101510]/22" />
        </div>
      </div>
    </div>
  );
}

function NutritionHUD() {
  return (
    <div className="float-fast absolute -left-5 top-14 z-20 w-[258px] rounded-xl border border-white/[0.15] bg-white/[0.12] p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,0.4),0_0_40px_rgba(215,255,104,0.06)] backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold">Today&apos;s targets</p>
        <span className="rounded-full bg-[#d7ff68] px-3 py-1 text-[12px] font-bold text-[#101510]">86%</span>
      </div>
      {[
        ["Calories", "1,840 / 2,150", "86%"],
        ["Protein", "126g / 150g", "84%"],
        ["Carbs", "188g / 220g", "78%"],
      ].map(([label, value, width]) => (
        <div key={label} className="mt-4">
          <div className="mb-1 flex justify-between text-[13px]">
            <span className="text-white/68">{label}</span>
            <span>{value}</span>
          </div>
          <div className="h-2 rounded-full bg-white/18">
            <div className="bar-grow h-2 rounded-full bg-[#d7ff68]" style={{ width }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CoachBubble() {
  return (
    <div className="pulse-card absolute bottom-[180px] left-[470px] z-40 w-[250px] rotate-2 rounded-xl border border-white/[0.15] bg-[#101510]/80 p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.45),0_0_50px_rgba(215,255,104,0.12)] backdrop-blur-2xl xl:left-[570px]">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-[#d7ff68] text-[#101510]">
          <Sparkle size={18} weight="fill" />
        </span>
        <div>
          <p className="font-semibold">Coach Ria</p>
          <p className="text-[12px] text-white/58">next meal recommendation</p>
        </div>
      </div>
      <p className="text-[13px] leading-6 text-white/82">
        You are short on protein and still have room for dinner. Pick tofu, dal, grilled chicken, or Greek yogurt with fruit.
      </p>
    </div>
  );
}

function StreakCard() {
  return (
    <div className="absolute -bottom-3 left-6 z-10 w-[220px] -rotate-3 rounded-xl border border-white/18 bg-[#d7ff68] p-4 text-[#101510] shadow-[0_34px_90px_rgba(0,0,0,0.35),0_0_40px_rgba(215,255,104,0.18)] xl:-bottom-6">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">Consistency</p>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[34px] font-semibold">7 days</p>
          <p className="text-[13px] font-semibold opacity-70">challenge streak saved</p>
        </div>
        <ChartLineUp size={34} weight="duotone" />
      </div>
    </div>
  );
}

function ProofStrip() {
  return (
    <section className="relative z-10 -mt-12 px-5 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-1 rounded-xl border border-black/8 bg-white p-2 shadow-[0_24px_70px_rgba(16,21,16,0.14)] md:grid-cols-4">
        {proof.map(({ title, body, icon: Icon }) => (
          <div key={title} className="group/card rounded-xl p-5 transition-all hover:bg-[#f0f6ef] hover:shadow-[0_8px_30px_rgba(16,21,16,0.06)]">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[#eef5f2] text-[#173c2b] transition-colors group-hover/card:bg-[#d7ff68] group-hover/card:text-[#101510]">
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
        <Header eyebrow="Product flow" title="From scan to daily guidance in minutes." />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {productMoments.map(({ kicker, title, copy, image, icon: Icon }) => (
            <article key={title} className="story-tile group relative min-h-[400px] overflow-hidden rounded-xl border border-white/10 bg-[#101510] p-7 text-white">
              <div className="absolute inset-0 opacity-34 transition group-hover:scale-105 group-hover:opacity-48">
                <Image src={image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
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
              One screen explains the whole day.
            </h2>
            <p className="mt-6 text-[17px] leading-8 text-white/70">
              See what you ate, what is left, and what meal would fit next without jumping between disconnected tools.
            </p>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {["Meal verification", "Daily macro dashboard", "Coach context", "Weight trends", "Challenges", "Weekly digest"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-semibold transition hover:bg-white/8">
                  <Check size={16} weight="bold" className="text-[#d7ff68]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[650px]">
            <div className="spin-ring absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="absolute left-0 top-20 w-[430px] rotate-[-4deg] rounded-xl border border-white/16 bg-white p-5 text-[#101510] shadow-[0_35px_90px_rgba(0,0,0,0.32)]">
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
            <div className="absolute bottom-16 right-0 w-[430px] rotate-[3deg] rounded-xl border border-white/16 bg-[#d7ff68] p-5 text-[#101510] shadow-[0_35px_90px_rgba(0,0,0,0.32)]">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">Next action</p>
              <h3 className="mt-2 text-[26px] font-semibold">Make dinner protein-led.</h3>
              <p className="mt-4 text-[14px] leading-6 opacity-76">You have enough carbs today. Add lean protein and vegetables, keep oils light.</p>
            </div>
            <div className="absolute right-24 top-0 h-[220px] w-[220px] overflow-hidden rounded-full border-[10px] border-white/10 shadow-[0_35px_90px_rgba(0,0,0,0.32)]">
              <Image src={mealImage} alt="Vegetable salad bowl" fill sizes="220px" className="object-cover" />
            </div>
            <div className="absolute bottom-0 left-24 w-[280px] rounded-xl border border-white/16 bg-white/12 p-5 backdrop-blur-xl">
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
              A simple loop that brings people back.
            </h2>
            <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#5f675f]">
              myNutriAI becomes more valuable after every saved meal because the coach, analytics, recommendations, challenges, and digests get more context.
            </p>
          </div>
          <div className="relative min-h-[520px] overflow-hidden rounded-xl bg-[#eef5f2] p-5">
            <Image
              src={mealImage}
              alt="Healthy vegetables and grains"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="absolute inset-0 object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#eef5f2] via-[#eef5f2]/90 to-[#eef5f2]/40" />
            <div className="relative z-10 grid h-full gap-4 md:grid-cols-2">
              {[
                ["08:15", "Breakfast scanned", "Oats, banana, honey", "410 kcal"],
                ["13:05", "Lunch verified", "Paneer bowl adjusted", "640 kcal"],
                ["17:40", "Coach check-in", "Protein short by 24g", "Next meal"],
                ["21:10", "Day closed", "86% calorie target", "Streak saved"],
              ].map(([time, title, body, tag]) => (
                <div key={title} className="routine-card rounded-xl border border-black/8 bg-white/82 p-5 shadow-[0_18px_50px_rgba(16,21,16,0.08)] backdrop-blur-lg">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#0f8b8d]" />
                    <p className="font-mono text-[12px] font-semibold text-[#0f8b8d]">{time}</p>
                  </div>
                  <h3 className="mt-3 text-[20px] font-semibold">{title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#5f675f]">{body}</p>
                  <span className="mt-4 inline-flex rounded-full bg-[#d7ff68] px-3 py-1 text-[12px] font-bold text-[#101510]">{tag}</span>
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
        <div className="relative min-h-[560px] overflow-hidden rounded-xl bg-[#173c2b] text-white">
          <Image
            src={phoneImage}
            alt="Ingredients for a personalized meal plan"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="absolute inset-0 object-cover opacity-34"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,60,43,0.20),rgba(23,60,43,0.96))]" />
          <div className="relative z-10 flex min-h-[560px] flex-col justify-end p-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#d7ff68]">Personal profile</p>
            <h2 className="display-heading mt-4 text-[48px] font-semibold leading-[0.98]">
              Recommendations match the person eating.
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-7 text-white/72">
              myNutriAI uses goals, body profile, allergies, preferences, budget, activity, timezone, and weight history to make personalization visible.
            </p>
          </div>
        </div>
        <div>
          <Header eyebrow="Personal context" title="Specific advice beats generic diet content." />
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {personalization.map((item) => (
              <div key={item} className="group/item flex items-center gap-3 rounded-xl border border-black/8 bg-white p-4 transition-all hover:border-[#173c2b]/20 hover:shadow-[0_8px_24px_rgba(16,21,16,0.06)]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eef5f2] text-[#173c2b] transition-colors group-hover/item:bg-[#d7ff68] group-hover/item:text-[#101510]">
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
          {pricing.map(({ name, price, period, subtitle, items, featured, cta, href }) => (
            <div key={name} className={`pricing-tile relative rounded-xl border p-7 ${featured ? "border-[#101510] bg-[#101510] text-white shadow-[0_30px_80px_rgba(16,21,16,0.24)]" : "border-black/10 bg-white"}`}>
              {featured && <span className="absolute -top-3 left-6 rounded-full bg-[#d7ff68] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#101510]">Popular</span>}
              <p className="text-[18px] font-semibold">{name}</p>
              <p className={featured ? "mt-2 text-[14px] text-white/62" : "mt-2 text-[14px] text-[#5f675f]"}>{subtitle}</p>
              <p className="mt-8 flex items-baseline gap-1">
                <span className="text-[48px] font-semibold leading-none">{price}</span>
                <span className={featured ? "text-[14px] font-semibold text-white/58" : "text-[14px] font-semibold text-[#5f675f]"}>{period}</span>
              </p>
              <ul className="mt-8 space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex gap-2 text-[14px]">
                    <Check size={16} weight="bold" className={featured ? "mt-0.5 text-[#d7ff68]" : "mt-0.5 text-[#0f8b8d]"} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition ${featured ? "bg-[#d7ff68] text-[#101510] hover:bg-white" : "bg-[#101510] text-white hover:bg-[#173c2b]"}`}
              >
                {cta}
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeoHub() {
  return (
    <section className="border-t border-black/10 bg-[#f8f8f3] px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0f8b8d]">Related guides</p>
          <h2 className="mt-4 text-[36px] font-semibold leading-tight text-[#173c2b] md:text-[44px]">
            A few practical guides for real meal tracking.
          </h2>
          <p className="mt-5 text-[16px] leading-7 text-[#5f675f]">
            Kept short so the landing page stays focused on trying the product.
          </p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {featuredSeoPages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group rounded-lg border border-black/10 bg-white p-5 transition hover:border-[#173c2b]/30 hover:shadow-[0_16px_42px_rgba(16,21,16,0.08)]"
            >
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">{page.eyebrow}</p>
              <h3 className="mt-3 text-[21px] font-bold leading-tight text-[#173c2b]">{page.primaryKeyword}</h3>
              <p className="mt-3 text-[14px] leading-6 text-[#5f675f]">{page.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-[#101510]">
                Read guide
                <ArrowRight size={14} weight="bold" className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
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
            Clear answers for editable scans, personal context, privacy, and day-by-day habit building.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map(({ question, answer }, index) => (
            <details
              key={question}
              className="faq-item group rounded-xl border border-black/8 bg-white p-6 shadow-[0_12px_36px_rgba(16,21,16,0.04)]"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-[17px] font-semibold leading-snug">
                <span>{question}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eef5f2] text-[#173c2b] transition-all group-open:rotate-180 group-open:bg-[#d7ff68] group-open:text-[#101510]">
                  <CaretDown size={16} weight="bold" />
                </span>
              </summary>
              <p className="mt-4 max-w-3xl border-t border-black/6 pt-4 text-[15px] leading-7 text-[#5f675f]">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Final() {
  return (
    <section className="relative overflow-hidden bg-[#d7ff68] px-5 py-28 text-[#101510] lg:px-8 lg:py-32">
      <div className="absolute right-[-90px] top-[-120px] h-[360px] w-[360px] rounded-full border-[50px] border-[#101510]/10" />
      <div className="absolute bottom-[-80px] left-[-60px] h-[260px] w-[260px] rounded-full border-[40px] border-[#101510]/6" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] opacity-70">myNutriAI</p>
          <h2 className="display-heading mt-4 max-w-3xl text-[50px] font-semibold leading-[0.98] md:text-[54px]">
            Turn the next meal into the next right decision.
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-7 opacity-70">Start tracking meals, get coached by Ria, and build a nutrition habit that lasts.</p>
        </div>
        <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101510] px-8 py-4 text-[15px] font-semibold text-white shadow-[0_16px_40px_rgba(16,21,16,0.18)] transition hover:bg-[#173c2b] hover:shadow-[0_20px_50px_rgba(16,21,16,0.24)]">
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
