import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteDescription, siteName, siteUrl } from "../seo";

export const metadata: Metadata = {
  title: "AI Meal Scanner for US and Indian Meals",
  description: siteDescription,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "myNutriAI - AI Meal Scanner for US and Indian Meals",
    description: siteDescription,
    url: siteUrl,
    siteName,
    images: [
      {
        url: "/screenshot.png",
        width: 1200,
        height: 630,
        alt: "myNutriAI AI nutrition tracker dashboard",
      },
    ],
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="relative min-h-screen bg-[#f8f8f3] text-[#101510]">{children}</div>;
}
