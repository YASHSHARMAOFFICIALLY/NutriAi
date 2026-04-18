const MACROS = [
  { label: "Protein", current: 54, goal: 130, color: "bg-sage" },
  { label: "Carbs",   current: 180, goal: 220, color: "bg-forest" },
  { label: "Fat",     current: 28, goal: 60,  color: "bg-ink/40" },
];

export function NutritionContext() {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col gap-4">
      {/* Today summary */}
      <div className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-[0_4px_20px_rgba(31,59,45,0.05)] backdrop-blur-sm">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Today&apos;s intake
        </p>

        <div className="mb-4 flex items-end gap-1.5">
          <span className="font-display text-[32px] font-bold leading-none text-ink">1 ,240</span>
          <span className="mb-1 text-[12px] text-ink-muted">/ 1,800 kcal</span>
        </div>

        {/* Remaining badge */}
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
          <span className="text-[12px] font-medium text-sage-600">560 kcal remaining</span>
        </div>

        <div className="flex flex-col gap-3">
          {MACROS.map((m) => {
            const pct = Math.min((m.current / m.goal) * 100, 100);
            return (
              <div key={m.label}>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-ink-muted">{m.label}</span>
                  <span className="font-medium text-ink">
                    {m.current}
                    <span className="text-ink-muted">/{m.goal}g</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.05]">
                  <div
                    className={`h-full rounded-full ${m.color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meals logged today */}
      <div className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-[0_4px_20px_rgba(31,59,45,0.05)] backdrop-blur-sm">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Logged today
        </p>
        <div className="flex flex-col gap-2">
          {[
            { name: "Greek yogurt bowl", kcal: 320, time: "8:14 AM" },
            { name: "Grilled chicken wrap", kcal: 480, time: "12:40 PM" },
            { name: "Almonds", kcal: 180, time: "3:22 PM" },
          ].map((meal) => (
            <div key={meal.name} className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-ink">{meal.name}</p>
                <p className="text-[10px] text-ink-muted">{meal.time}</p>
              </div>
              <span className="text-[12px] font-semibold text-ink-muted">{meal.kcal}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
