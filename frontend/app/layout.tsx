import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { JsonLd } from "./JsonLd";
import { LenisProvider } from "./lenis-provider";
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

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd(), siteNavigationJsonLd()]} />
      </head>
      <body>
        <SiteVisitTracker />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
