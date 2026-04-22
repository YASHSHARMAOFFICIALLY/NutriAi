import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "NutriAI - AI nutrition tracking",
  description:
    "Track meals, macros, progress, and AI nutrition coaching in one product-led SaaS experience.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="relative min-h-screen bg-[#f8f8f3] text-[#101510]">{children}</div>;
}
