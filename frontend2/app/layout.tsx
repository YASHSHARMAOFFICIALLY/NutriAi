import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "NutriAI - AI nutrition tracking",
  description: "Track meals, macros, progress, and AI nutrition coaching in one product-led SaaS experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
