import { MealLine } from "../../_components/ui";
import type { Meal } from "../../_components/ui";

export function TodayMeals({ meals = [] }: { meals?: Meal[] }) {
  return <div className="space-y-3">{meals.map((meal) => <MealLine key={meal.id} meal={meal} />)}{!meals.length ? <p className="text-[13px] text-[#5f675f]">No meals logged today.</p> : null}</div>;
}
