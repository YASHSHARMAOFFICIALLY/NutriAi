import { motion } from "framer-motion";

export function WeeklyChart({ days = [] }: { days?: Array<{ date: string; calories: number }> }) {
  const max = Math.max(1, ...days.map((day) => day.calories));
  
  return (
    <div className="flex h-64 items-end gap-3 rounded-2xl bg-surface-alt p-6 border border-border">
      {days.map((day, i) => (
        <div key={day.date} className="group relative flex flex-1 flex-col items-center gap-3">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${(day.calories / max) * 100}%` }}
            transition={{ type: "spring", stiffness: 60, delay: i * 0.1 }}
            className="w-full min-h-[4px] rounded-t-lg bg-forest group-hover:bg-teal transition-colors shadow-sm"
          />
          <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-forest px-3 py-1.5 text-[11px] font-bold text-white group-hover:block whitespace-nowrap shadow-premium">
            {day.calories} kcal
          </div>
          <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">{day.date}</span>
        </div>
      ))}
      {!days.length ? <p className="self-center text-[13px] font-semibold text-muted">No live weekly data.</p> : null}
    </div>
  );
}
