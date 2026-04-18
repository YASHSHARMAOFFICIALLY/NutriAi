import { Plus } from "@phosphor-icons/react/dist/ssr";

const MEALS = [
  {
    name: "Overnight oats with banana",
    time: "8:14 AM",
    kcal: 380,
    tag: "Breakfast",
    tagColor: "bg-yellow-50 text-yellow-700",
  },
  {
    name: "Grain bowl · salmon & greens",
    time: "1:02 PM",
    kcal: 486,
    tag: "Lunch",
    tagColor: "bg-sage/10 text-sage-600",
  },
  {
    name: "Almonds (30g)",
    time: "3:45 PM",
    kcal: 180,
    tag: "Snack",
    tagColor: "bg-cream-2 text-ink-muted",
  },
] as const;

export function TodayMeals() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[20px] font-bold text-ink">Meals today</h3>
        <a
          href="/snap"
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[13px] font-semibold text-cream transition-opacity hover:opacity-85"
        >
          <Plus size={13} weight="bold" />
          Log meal
        </a>
      </div>

      <div className="flex flex-col gap-2">
        {MEALS.map((meal) => (
          <div
            key={meal.name}
            className="group flex items-center justify-between rounded-2xl border border-white/60 bg-white/50 px-5 py-4 backdrop-blur-sm transition-all duration-200 hover:border-white/80 hover:bg-white/70 hover:shadow-[0_4px_16px_rgba(31,59,45,0.06)]"
          >
            <div>
              <p className="text-[14px] font-medium text-ink">{meal.name}</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">{meal.time}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${meal.tagColor}`}>
                {meal.tag}
              </span>
              <span className="font-display text-[15px] font-bold text-ink">
                {meal.kcal}
                <span className="ml-0.5 text-[11px] font-normal text-ink-muted">kcal</span>
              </span>
            </div>
          </div>
        ))}

        {/* Empty slot — prompt for dinner */}
        <div className="flex items-center justify-between rounded-2xl border border-dashed border-ink/10 px-5 py-4 text-ink-muted transition-colors hover:border-sage/40 hover:text-sage-600">
          <p className="text-[13px]">Add dinner</p>
          <Plus size={15} className="opacity-50" />
        </div>
      </div>
    </div>
  );
}
