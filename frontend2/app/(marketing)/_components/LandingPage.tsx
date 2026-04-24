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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#101510]/78 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#d7ff68] text-[#101510]">
            <ForkKnife size={17} weight="bold" />
          </span>
          NutriAI
        </Link>
        <nav className="hidden items-center gap-8 text-[14px] font-medium text-white/76 md:flex">
          <a href="#product" className="hover:text-white">Product</a>
          <a href="#loop" className="hover:text-white">Routine</a>
          <a href="#personal" className="hover:text-white">Personal</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-[14px] font-semibold text-[#101510] transition hover:bg-[#d7ff68]"
        >
          Log meal
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[#101510] text-white">
      <img
        src={heroImage}
        alt="Colorful nutrition bowl with grains and vegetables"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,21,16,0.94)_0%,rgba(16,21,16,0.76)_42%,rgba(16,21,16,0.22)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#101510] to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-[92vh] max-w-7xl items-center gap-8 px-5 pb-28 pt-28 xl:grid-cols-[0.72fr_1.28fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="hero-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-semibold backdrop-blur-md">
            <Sparkle size={14} weight="fill" className="text-[#d7ff68]" />
            Meal scanner, coach, tracker, and habit system
          </div>
          <h1 className="hero-reveal hero-delay-1 display-heading text-[46px] font-semibold leading-[0.98] md:text-[72px]">
            Know what to eat next, not just what you ate.
          </h1>
          <p className="hero-reveal hero-delay-2 mt-7 max-w-2xl text-[18px] leading-8 text-white/78 md:text-[19px]">
            Snap a meal, verify the macros, save it to your day, then let NutriAI guide dinner, weight progress, streaks, and weekly habits.
          </p>
          <div className="hero-reveal hero-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d7ff68] px-6 py-3 text-[15px] font-semibold text-[#101510] transition hover:bg-white">
              Log your first meal
              <ArrowRight size={16} weight="bold" />
            </Link>
            <a href="#product" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/24 bg-white/10 px-6 py-3 text-[15px] font-semibold text-white backdrop-blur-md transition hover:bg-white/16">
              See the product loop
            </a>
          </div>
          <div className="hero-reveal hero-delay-3 mt-10 grid max-w-xl grid-cols-3 gap-3 text-center">
            {[
              ["24g", "protein gap"],
              ["86%", "target hit"],
              ["7 day", "streak"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md border border-white/16 bg-white/10 px-3 py-3 backdrop-blur-md">
                <p className="text-[22px] font-semibold">{value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/56">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-stage hidden xl:block">
          <NutritionHUD />
          <FloatingPhone />
          <CoachBubble />
          <StreakCard />
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/55 md:block">
        Scroll for product proof
      </div>
    </section>
  );
}

function FloatingPhone() {
  return (
    <div className="float-slow absolute left-[275px] top-10 z-30 h-[540px] w-[270px] rounded-[34px] border border-white/20 bg-[#101510] p-3 shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
      <div className="h-full overflow-hidden rounded-[28px] bg-[#f8f8f3] text-[#101510]">
        <img src={phoneImage} alt="Healthy meal ingredients" className="h-44 w-full object-cover" />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f675f]">Lunch analysis</p>
            <span className="rounded-full bg-[#d7ff68] px-2.5 py-1 text-[11px] font-bold">92% sure</span>
          </div>
          <h3 className="mt-2 text-[21px] font-semibold">Greek bowl</h3>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {[
              ["612", "kcal"],
              ["42g", "protein"],
              ["58g", "carbs"],
              ["19g", "fat"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md border border-black/10 bg-white p-2.5">
                <p className="text-[19px] font-semibold">{value}</p>
                <p className="text-[11px] text-[#5f675f]">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md bg-[#eef5f2] p-3">
            <p className="text-[12px] font-semibold text-[#173c2b]">Saved to today</p>
            <p className="mt-1 text-[12px] text-[#5f675f]">Dinner recommendation updated.</p>
          </div>
          <button className="mt-4 w-full rounded-md bg-[#173c2b] py-3 text-[13px] font-semibold text-white">
            Confirm meal
          </button>
        </div>
      </div>
    </div>
  );
}

function NutritionHUD() {
  return (
    <div className="float-fast absolute left-0 top-7 z-20 w-[258px] rounded-lg border border-white/20 bg-white/14 p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl">
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
    <div className="pulse-card absolute bottom-24 left-[565px] z-40 w-[235px] rounded-lg border border-white/20 bg-[#101510]/84 p-4 text-white shadow-[0_30px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
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
    <div className="absolute bottom-10 left-10 z-10 w-[220px] rounded-lg border border-white/18 bg-[#d7ff68] p-4 text-[#101510] shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
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
