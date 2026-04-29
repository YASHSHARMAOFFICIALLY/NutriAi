export const siteUrl = "https://mynutriai.app";

export const siteName = "myNutriAI";

export const siteDescription =
  "myNutriAI is an AI meal scanner for US and Indian meals, food photos, editable calories, protein targets, macro tracking, and daily nutrition guidance.";

export const seoKeywords = [
  "myNutriAI",
  "myNutriAI app",
  "AI nutrition tracker",
  "AI meal scanner",
  "AI meal scanner for mixed meals",
  "calorie tracker app",
  "macro tracker",
  "food photo calorie counter",
  "nutrition coach app",
  "US calorie tracker",
  "American food calorie tracker",
  "Indian meal calorie tracker",
  "Indian food calorie counter",
  "burrito bowl calorie tracker",
  "salad calorie tracker",
  "dal rice calorie tracker",
  "roti sabzi calorie tracker",
  "meal logging app",
  "protein tracker",
  "weight loss nutrition app",
];

export const siteOgImage = "/screenshot.png";

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/ai-meal-scanner?meal={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: absoluteUrl("/icon.svg"),
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description: siteDescription,
    image: absoluteUrl(siteOgImage),
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "9",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "9",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
      },
    ],
    featureList: [
      "AI meal photo analysis",
      "Editable calorie and macro estimates",
      "Daily nutrition dashboard",
      "Meal recommendations",
      "AI nutrition coach",
      "Weight tracking and trends",
      "Telegram meal logging",
    ],
  };
}

export function siteNavigationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      { "@type": "SiteNavigationElement", position: 1, name: "AI Meal Scanner", url: absoluteUrl("/ai-meal-scanner") },
      { "@type": "SiteNavigationElement", position: 2, name: "Indian Meal Tracker", url: absoluteUrl("/indian-meal-calorie-tracker") },
      { "@type": "SiteNavigationElement", position: 3, name: "US Meal Tracker", url: absoluteUrl("/us-meal-calorie-tracker") },
      { "@type": "SiteNavigationElement", position: 4, name: "Macro Tracker", url: absoluteUrl("/macro-tracker") },
      { "@type": "SiteNavigationElement", position: 5, name: "Pricing", url: absoluteUrl("/pricing") },
    ],
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: input.url,
    image: absoluteUrl(siteOgImage),
    keywords: input.keywords?.join(", "),
    author: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.svg"),
      },
    },
    mainEntityOfPage: input.url,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
    },
  };
}

export function howToJsonLd(input: {
  name: string;
  description: string;
  steps: Array<{ title: string; body: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.body,
    })),
  };
}
