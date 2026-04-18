import { MealCard, type Meal } from "./MealCard";

interface Props {
  label: string;
  meals: Meal[];
  totalKcal: number;
  startIndex: number;
}

export function DayGroup({ label, meals, totalKcal, startIndex }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">{label}</p>
        <p className="text-[12px] text-ink-muted">
          <span className="font-semibold text-ink">{totalKcal}</span> kcal
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {meals.map((meal, i) => (
          <MealCard key={meal.id} meal={meal} index={startIndex + i} />
        ))}
      </div>
    </div>
  );
}
