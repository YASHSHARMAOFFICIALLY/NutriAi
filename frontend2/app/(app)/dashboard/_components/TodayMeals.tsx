import { todayMeals } from "../../_components/mock-data";
import { MealLine } from "../../_components/ui";

export function TodayMeals() {
  return <div className="space-y-3">{todayMeals.map((meal) => <MealLine key={meal.id} meal={meal} />)}</div>;
}
