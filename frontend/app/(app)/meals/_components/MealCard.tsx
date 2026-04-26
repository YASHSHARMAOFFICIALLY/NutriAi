import type { Meal } from "../../_components/ui";
import { MealLine } from "../../_components/ui";

export function MealCard({ meal }: { meal: Meal }) {
  return <MealLine meal={meal} expanded />;
}
