"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Crown, Lightning } from "@phosphor-icons/react/dist/ssr";
import { UnauthorizedError } from "@/lib/api/client";
import { createCheckout, type UserPlan } from "@/lib/api/payments";
import { getMyPlan } from "@/lib/api/payments";
import { withNextParam } from "@/lib/safeRedirect";
import { PageHeader, Panel } from "../_components/ui";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    subtitle: "For the first meal habit",
    features: [
      "Meal logging",
      "Daily macro targets",
      "3 food analyses per day",
      "Saved meal history",
      "Basic dashboard",
    ],
  },
  {
    id: "monthly" as const,
    name: "Pro",
    price: "$4.99",
    period: "/month",
    subtitle: "For daily coaching",
    featured: true,
    features: [
      "Everything in Free",
      "Unlimited food analysis",
      "Coach Ria AI chat",
      "Meal recommendations",
      "Weight tracking & trends",
      "Challenges & streaks",
      "Weekly digest emails",
      "Family sharing",
      "Priority support",
    ],
  },
  {
    id: "lifetime" as const,
    name: "Pro Lifetime",
    price: "$25",
    period: "one-time",
    subtitle: "Pay once, use forever",
    features: [
      "Everything in Pro",
      "Lifetime access",
      "All future features",
      "No recurring charges",
    ],
  },
];

function PricingContent() {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [loading, setLoading] = useState<"monthly" | "lifetime" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyPlan({ silent: true })
      .then(setPlan)
      .catch(() => {})
      .finally(() => setPlanLoaded(true));
  }, []);

  const handleCheckout = useCallback(async (planId: "monthly" | "lifetime") => {
    setLoading(planId);
    setError(null);
    try {
      const { paymentLink } = await createCheckout(planId, { silent: true });
      if (paymentLink) {
        window.location.href = paymentLink;
      }
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        window.location.href = withNextParam("/login", `/pricing?checkout=${planId}`);
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }, []);

  const isPro = plan?.tier === "PRO" && (plan.status === "ACTIVE" || plan.status === "PAST_DUE");
  const trustItems = ["Secure checkout", "Editable AI results", "Cancel anytime", "No ads"];
  const proOutcomes = [
    { label: "Daily ceiling", value: "Unlimited scans", copy: "Use it for snacks, restaurant meals, and corrections without waiting for tomorrow." },
    { label: "Decision support", value: "Coach + next meal", copy: "Turn logged food, targets, and preferences into the next practical choice." },
    { label: "Habit loop", value: "Trends + digests", copy: "Keep weight, streaks, challenges, and weekly summaries in one routine." },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow="Upgrade"
        title="Choose your plan"
        description="Free keeps the core food diary open. Pro removes daily limits and adds coaching, recommendations, trends, and family workflows."
      />

      {isPro && (
        <Panel className="mb-6 border-[#d7ff68]/40 bg-[#d7ff68]/10">
          <div className="flex items-center gap-3 p-4">
            <Crown size={24} weight="fill" className="text-[#0f8b8d]" />
            <div>
              <p className="font-semibold text-forest">You are on the Pro plan</p>
              {plan?.currentPeriodEnd && (
                <p className="text-[13px] text-[#5f675f]">
                  {plan.cancelledAt
                    ? `Access until ${new Date(plan.currentPeriodEnd).toLocaleDateString()}`
                    : `Renews ${new Date(plan.currentPeriodEnd).toLocaleDateString()}`}
                </p>
              )}
            </div>
          </div>
        </Panel>
      )}

      <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-[13px] font-bold text-forest">
            <Check size={15} weight="bold" className="text-teal" />
            {item}
          </div>
        ))}
      </div>

      <Panel className="mb-6 overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
          <div className="bg-forest p-6 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-lime">Why Pro</p>
            <h2 className="mt-3 text-[24px] font-bold leading-tight">Built for users who log more than one meal.</h2>
            <p className="mt-3 text-[13px] leading-6 text-white/72">
              The upgrade removes the daily scan bottleneck and makes the app useful before the next meal, not only after eating.
            </p>
          </div>
          <div className="grid gap-3 bg-surface-alt p-4 md:grid-cols-3">
            {proOutcomes.map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{item.label}</p>
                <p className="mt-2 text-[18px] font-bold text-forest">{item.value}</p>
                <p className="mt-2 text-[12px] leading-5 text-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map(({ id, name, price, period, subtitle, featured, features }) => (
          <div
            key={id}
            className={`relative flex flex-col rounded-lg border p-6 ${
              featured
                ? "border-forest bg-forest text-white shadow-lg"
                : "border-black/10 bg-white"
            }`}
          >
            {featured && (
              <span className="absolute -top-3 left-5 rounded-md bg-[#d7ff68] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-forest">
                Most popular
              </span>
            )}

            <div>
              <p className="text-[17px] font-semibold">{name}</p>
              <p className={`mt-1 text-[13px] ${featured ? "text-white/60" : "text-[#5f675f]"}`}>
                {subtitle}
              </p>
            </div>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-[42px] font-bold leading-none">{price}</span>
              <span className={`text-[14px] ${featured ? "text-white/60" : "text-[#5f675f]"}`}>
                {period}
              </span>
            </div>

            <ul className="mt-6 flex-1 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[14px]">
                  <Check
                    size={16}
                    weight="bold"
                    className={`mt-0.5 shrink-0 ${featured ? "text-[#d7ff68]" : "text-[#0f8b8d]"}`}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {id === "free" ? (
                isPro ? (
                  <div
                    className="flex w-full items-center justify-center rounded-lg border border-black/10 py-3 text-[14px] font-semibold text-[#5f675f]"
                  >
                    Current base plan
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-center rounded-lg border border-black/10 py-3 text-[14px] font-semibold text-[#0f8b8d]">
                    <Check size={16} weight="bold" className="mr-2" />
                    Your current plan
                  </div>
                )
              ) : isPro ? (
                <div
                  className={`flex w-full items-center justify-center rounded-lg py-3 text-[14px] font-semibold ${
                    featured ? "bg-[#d7ff68]/20 text-[#d7ff68]" : "bg-[#eef5f2] text-[#0f8b8d]"
                  }`}
                >
                  <Check size={16} weight="bold" className="mr-2" />
                  Active
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(id)}
                  disabled={loading !== null}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-semibold transition-colors disabled:opacity-50 ${
                    featured
                      ? "bg-[#d7ff68] text-forest hover:bg-white"
                      : "bg-forest text-white hover:bg-[#173c2b]"
                  }`}
                >
                  {loading === id ? (
                    "Redirecting..."
                  ) : (
                    <>
                      <Lightning size={16} weight="fill" />
                      Upgrade to {name}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Panel className="mt-6 p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_220px] md:items-center">
          <div>
            <h2 className="text-[18px] font-bold text-forest">What changes after upgrading?</h2>
            <p className="mt-2 text-[13px] leading-6 text-muted">
              Pro is designed for repeated daily use: fewer limits, more guidance, and clearer progress views without changing the core diary workflow.
            </p>
          </div>
          <Link href="/snap" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-alt px-4 py-3 text-[13px] font-bold text-forest transition-colors hover:bg-white">
            Try logging first
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </Panel>

      <p className="mt-6 text-center text-[13px] text-[#5f675f]">
        Payments are processed securely by Dodo Payments. Subscription changes are reflected after payment confirmation.
      </p>
    </div>
  );
}

function PricingFallback() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <PageHeader
        eyebrow="Upgrade"
        title="Choose your plan"
        description="Free keeps the core food diary open. Pro removes daily limits and adds coaching, recommendations, trends, and family workflows."
      />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingFallback />}>
      <PricingContent />
    </Suspense>
  );
}
