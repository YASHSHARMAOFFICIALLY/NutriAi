import { apiFetch } from "./client";
import { withQuery } from "./query";
import { todayKey } from "@/lib/date";
import type { CreateMealInput, DailySummary, MealDTO } from "./types";

interface ListMealsResponse {
  date: string;
  meals: MealDTO[];
}

interface ListMealsRangeResponse {
  from: string;
  to: string;
  meals: MealDTO[];
}

export async function createMeal(input: CreateMealInput): Promise<MealDTO> {
  const res = await apiFetch<{ meal: MealDTO }>("/meals", {
    method: "POST",
    body: input,
  });
  return res.meal;
}

export function listMeals(date?: string): Promise<MealDTO[]> {
  const resolvedDate = date ?? todayKey();
  return apiFetch<ListMealsResponse>(withQuery("/meals", { date: resolvedDate })).then(
    (res) => res.meals,
  );
}

export function listMealsRange(from: string, to: string): Promise<MealDTO[]> {
  return apiFetch<ListMealsRangeResponse>(withQuery("/meals", { from, to })).then(
    (res) => res.meals,
  );
}

export function getDailySummary(date?: string): Promise<DailySummary> {
  return apiFetch<DailySummary>(withQuery("/meals/daily-summary", { date }));
}

export function deleteMeal(id: string): Promise<void> {
  return apiFetch<void>(`/meals/${id}`, { method: "DELETE" });
}

/** Pick a meal type based on the current hour of day. */
export function inferMealType(d: Date = new Date()): CreateMealInput["mealType"] {
  const h = d.getHours();
  if (h < 11) return "BREAKFAST";
  if (h < 15) return "LUNCH";
  if (h < 18) return "SNACK";
  return "DINNER";
}
