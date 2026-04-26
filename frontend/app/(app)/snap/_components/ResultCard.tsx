import { MealLine } from "../../_components/ui";
import type { Meal } from "../../_components/ui";

export function ResultCard({ meal }: { meal?: Meal }) {
  if (!meal) return <p className="text-[13px] text-[#5f675f]">No live analysis result yet.</p>;
  return <MealLine meal={meal} expanded />;
}
