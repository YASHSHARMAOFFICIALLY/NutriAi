import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LenisProvider } from "./_lib/lenis-provider";

// Fonts — self-hosted via next/font/local. The .woff2 files live in
// public/fonts/ (see public/fonts/README.md for filenames + sources).
// Uncomment the block below once the files are dropped in.
//
// import localFont from "next/font/local";
//
// const grotesk = localFont({
//   src: [
//     { path: "../../public/fonts/overused-grotesk-regular.woff2", weight: "400", style: "normal" },
//     { path: "../../public/fonts/overused-grotesk-medium.woff2", weight: "500", style: "normal" },
//     { path: "../../public/fonts/overused-grotesk-semibold.woff2", weight: "600", style: "normal" },
//   ],
//   variable: "--font-grotesk",
//   display: "swap",
// });
//
// const caudex = localFont({
//   src: [
//     { path: "../../public/fonts/caudex-regular.woff2", weight: "400", style: "normal" },
//     { path: "../../public/fonts/caudex-bold.woff2", weight: "700", style: "normal" },
//   ],
//   variable: "--font-caudex",
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "NutriAI — Know exactly what you eat",
  description:
    "Snap a meal or type it out. NutriAI returns calories, macros, and a plan tailored to your goals — with an AI chat assistant, streaks, and a developer API.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  // Once localFont is enabled, add `${grotesk.variable} ${caudex.variable}` here.
  return (
    <LenisProvider>
      <div className="relative min-h-screen bg-cream text-ink">{children}</div>
    </LenisProvider>
  );
}
