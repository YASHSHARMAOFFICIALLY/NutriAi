import type { Meal } from "../../_components/mock-data";
import { MealLine } from "../../_components/ui";

export function MealCard({ meal }: { meal: Meal }) {
  return <MealLine meal={meal} expanded />;
}
