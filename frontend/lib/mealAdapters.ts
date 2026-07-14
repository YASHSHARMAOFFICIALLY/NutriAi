import type { MealDTO } from "@/lib/api/types";
import type { Meal } from "@/app/(app)/_components/ui";

export type DiaryMeal = Meal & { loggedDate: string };

export function mealFromApi(meal: MealDTO): DiaryMeal {
  const loggedAt = new Date(meal.loggedAt);
  return {
    id: meal.id,
    mealType: meal.mealType,
    title: meal.notes || meal.items[0]?.name || meal.mealType.toLowerCase(),
    loggedAt: loggedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    loggedDate: loggedAt.toISOString().slice(0, 10),
    source: meal.foodQueryId ? "IMAGE" : "TEXT",
    provider: "db",
    cached: false,
    confidence: 1,
    totals: {
      calories: Math.round(meal.totalCalories),
      protein: Math.round(meal.totalProtein),
      carbs: Math.round(meal.totalCarbs),
      fat: Math.round(meal.totalFat),
    },
    items: meal.items.map((item) => ({
      name: item.name,
      quantity: item.quantity ?? "",
      calories: Math.round(item.calories),
      protein: Math.round(item.protein),
      carbs: Math.round(item.carbs),
      fat: Math.round(item.fat),
      confidence: 1,
    })),
  };
}
