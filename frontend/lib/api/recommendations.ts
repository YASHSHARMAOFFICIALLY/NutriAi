import { apiFetch } from "./client";
import type { MealRecommendation, RecommendationsQuery } from "./types";

export function getMealRecommendations(q: RecommendationsQuery = {}): Promise<MealRecommendation[]> {
  const parts: string[] = [];
  if (q.mealType) parts.push(`mealType=${q.mealType}`);
  if (q.limit != null) parts.push(`limit=${q.limit}`);
  if (q.remainingCalories != null) parts.push(`remainingCalories=${q.remainingCalories}`);
  if (q.remainingProtein != null) parts.push(`remainingProtein=${q.remainingProtein}`);
  if (q.remainingCarbs != null) parts.push(`remainingCarbs=${q.remainingCarbs}`);
  if (q.remainingFat != null) parts.push(`remainingFat=${q.remainingFat}`);
  const query = parts.length ? `?${parts.join("&")}` : "";
  return apiFetch<MealRecommendation[]>(`/recommendations/meals${query}`);
}
