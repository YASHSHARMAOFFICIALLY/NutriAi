import type { Meal } from "../../_components/ui";
import { MealCard } from "./MealCard";

export function DayGroup({ date, meals }: { date: string; meals: Meal[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[22px] font-semibold">{date}</h2>
      {meals.map((meal) => <MealCard key={meal.id} meal={meal} />)}
    </section>
  );
}
