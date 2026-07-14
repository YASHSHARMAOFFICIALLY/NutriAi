import type { Metadata, Viewport } from "next";
import { Analytics } from "@hellyeah/x-ray/next";
import { Hanken_Grotesk, Fraunces } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { JsonLd } from "./JsonLd";
import { LenisProvider } from "./lenis-provider";
import { MotionProvider } from "./motion-provider";
import { SiteVisitTracker } from "./SiteVisitTracker";
import {
  organizationJsonLd,
  seoKeywords,
  siteDescription,
  siteName,
  siteNavigationJsonLd,
  siteOgImage,
  siteUrl,
  websiteJsonLd,
} from "./seo";

const hankenSans = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#101510",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  manifest: "/manifest.json",
  title: {
    default: "myNutriAI - AI Meal Scanner for US and Indian Meals",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: seoKeywords,
  authors: [{ name: "NutriAI" }],
  creator: "NutriAI",
  publisher: "NutriAI",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: "myNutriAI - AI Meal Scanner for US and Indian Meals",
    description: siteDescription,
    images: [
      {
        url: "/screenshot.png",
        width: 1200,
        height: 630,
        alt: "myNutriAI AI nutrition tracker dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "myNutriAI - AI Meal Scanner for US and Indian Meals",
    description: siteDescription,
    images: [siteOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${hankenSans.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <head>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd(), siteNavigationJsonLd()]} />
      </head>
      <body>
        <Analytics
          websiteId={process.env.NEXT_PUBLIC_HELLYEAH_TRACKER_ID!}
          env={process.env.NEXT_PUBLIC_HELLYEAH_TRACKER_ENV}
          domains="mynutriai.app"
        />
        <SiteVisitTracker />
        <LenisProvider>
          <MotionProvider>{children}</MotionProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
