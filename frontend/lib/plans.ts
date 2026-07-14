// Single source of truth for pricing plans, shared by /pricing and the marketing
// landing page. Copy reflects the real policy: Free has hard daily limits; Pro
// has unlimited text analysis but a 50/day fair-use cap on photo scans.

export type PlanId = "free" | "monthly" | "lifetime";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  /** Short cadence shown next to the price, e.g. "forever", "/month". */
  cadence: string;
  subtitle: string;
  featured?: boolean;
  /** Marketing CTA label used on the landing page. */
  cta: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    subtitle: "For the first meal habit",
    cta: "Start free",
    features: [
      "5 text analyses a day",
      "3 photo scans a day",
      "3 coach messages a day",
      "Daily macro targets",
      "1 active challenge",
      "Saved meal history",
    ],
  },
  {
    id: "monthly",
    name: "Pro",
    price: "$4.99",
    cadence: "/month",
    subtitle: "For daily coaching",
    featured: true,
    cta: "Start Pro",
    features: [
      "Unlimited text analyses",
      "Photo scans up to 50 a day",
      "Priority coach access",
      "Full meal recommendations",
      "Weight tracking and trends",
      "Challenges and streaks",
      "Weekly digest emails",
      "Family invites and sharing",
    ],
  },
  {
    id: "lifetime",
    name: "Pro Lifetime",
    price: "$25",
    cadence: "one-time",
    subtitle: "Pay once, use forever",
    cta: "Get lifetime",
    features: [
      "Everything in Pro",
      "Lifetime access",
      "All future features",
      "No recurring charges",
    ],
  },
];

export const PAID_PLAN_IDS = ["monthly", "lifetime"] as const;
export type PaidPlanId = (typeof PAID_PLAN_IDS)[number];

export function isPaidPlanId(value: string | null): value is PaidPlanId {
  return value === "monthly" || value === "lifetime";
}
