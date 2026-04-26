import { apiFetch } from "./client";
import type { CreateMealInput, DailySummary, MealDTO } from "./types";

interface ListMealsResponse {
  date: string;
  meals: MealDTO[];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function createMeal(input: CreateMealInput): Promise<MealDTO> {
  const res = await apiFetch<{ meal: MealDTO }>("/meals", {
    method: "POST",
    body: input,
  });
  return res.meal;
}

export function listMeals(date?: string): Promise<MealDTO[]> {
  const resolvedDate = date ?? todayISO();
  return apiFetch<ListMealsResponse>(`/meals?date=${encodeURIComponent(resolvedDate)}`).then(
    (res) => res.meals,
  );
}

export function getDailySummary(date?: string): Promise<DailySummary> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return apiFetch<DailySummary>(`/meals/daily-summary${query}`);
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
