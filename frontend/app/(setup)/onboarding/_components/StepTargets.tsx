interface Props {
  calories: string;
  protein: string;
  onCalories: (v: string) => void;
  onProtein: (v: string) => void;
}

export function StepTargets({ calories, protein, onCalories, onProtein }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/70 bg-white/60 p-5 backdrop-blur-sm">
        <label className="block">
          <p className="mb-1 text-[13px] font-semibold text-ink">Daily calorie target</p>
          <p className="mb-3 text-[12px] text-ink-muted">We calculated this based on your goal and activity level.</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={calories}
              onChange={(e) => onCalories(e.target.value)}
              className="w-28 rounded-xl border border-ink/[0.08] bg-cream/70 px-4 py-2.5 font-display text-[22px] font-bold text-ink outline-none transition focus:border-sage/60 focus:ring-2 focus:ring-sage/10"
            />
            <span className="text-[14px] text-ink-muted">kcal / day</span>
          </div>
        </label>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/60 p-5 backdrop-blur-sm">
        <label className="block">
          <p className="mb-1 text-[13px] font-semibold text-ink">Daily protein target</p>
          <p className="mb-3 text-[12px] text-ink-muted">Set higher if building muscle, lower for general health.</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={protein}
              onChange={(e) => onProtein(e.target.value)}
              className="w-28 rounded-xl border border-ink/[0.08] bg-cream/70 px-4 py-2.5 font-display text-[22px] font-bold text-ink outline-none transition focus:border-sage/60 focus:ring-2 focus:ring-sage/10"
            />
            <span className="text-[14px] text-ink-muted">g / day</span>
          </div>
        </label>
      </div>

      <p className="text-[12px] text-ink-muted/70">
        You can always change these later in Settings.
      </p>
    </div>
  );
}
