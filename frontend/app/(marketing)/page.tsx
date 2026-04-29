import LandingPage from "./_components/LandingPage";
import { JsonLd } from "../JsonLd";
import {
  faqJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "../seo";

const structuredData = [
  softwareApplicationJsonLd(),
  websiteJsonLd(),
  faqJsonLd([
      {
        question: "Can myNutriAI handle Indian meals and mixed plates?",
        answer:
          "Yes. myNutriAI is built for mixed meals such as dal rice, paneer bowls, wraps, salads, and restaurant plates, with editable portions before saving.",
      },
      {
        question: "What happens if the food analysis is wrong?",
        answer:
          "Users can edit food items, serving sizes, calories, and macros before confirming a meal.",
      },
      {
        question: "Is myNutriAI only a calorie tracker?",
        answer:
          "No. myNutriAI combines calorie and macro tracking with recommendations, weight trends, challenges, history, weekly digests, and AI coaching.",
      },
    ]),
];

export default function MarketingHome() {
  return (
    <>
      <JsonLd data={structuredData} />
      <LandingPage />
    </>
  );
}
