import { apiFetch } from "./client";
import { withQuery } from "./query";
import type { MealRecommendationsResponse, RecommendationsQuery } from "./types";

export function getMealRecommendations(q: RecommendationsQuery = {}): Promise<MealRecommendationsResponse> {
  return apiFetch<MealRecommendationsResponse>(withQuery("/recommendations/meals", q));
}
