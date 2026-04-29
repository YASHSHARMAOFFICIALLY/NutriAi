import LandingPage from "./_components/LandingPage";
import { siteDescription, siteName, siteUrl } from "../seo";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description: siteDescription,
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
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can myNutriAI handle Indian meals and mixed plates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. myNutriAI is built for mixed meals such as dal rice, paneer bowls, wraps, salads, and restaurant plates, with editable portions before saving.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if the food analysis is wrong?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Users can edit food items, serving sizes, calories, and macros before confirming a meal.",
        },
      },
      {
        "@type": "Question",
        name: "Is myNutriAI only a calorie tracker?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. myNutriAI combines calorie and macro tracking with recommendations, weight trends, challenges, history, weekly digests, and AI coaching.",
        },
      },
    ],
  },
];

export default function MarketingHome() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage />
    </>
  );
}
