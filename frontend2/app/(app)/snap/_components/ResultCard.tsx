import { analysisCandidate } from "../../_components/mock-data";
import type { Meal } from "../../_components/mock-data";
import { MealLine } from "../../_components/ui";

export function ResultCard() {
  const meal: Meal = {
    id: analysisCandidate.queryId,
    mealType: analysisCandidate.mealType,
    title: analysisCandidate.title,
    loggedAt: "preview",
    source: "IMAGE",
    provider: "openai",
    cached: analysisCandidate.cached,
    confidence: analysisCandidate.confidence,
    totals: analysisCandidate.totals,
    items: analysisCandidate.items,
  };

  return <MealLine meal={meal} expanded />;
}
