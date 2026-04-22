import { analytics } from "../../_components/mock-data";

export function WeeklyChart() {
  const max = Math.max(...analytics.days.map((day) => day.calories));
  return (
    <div className="flex h-56 items-end gap-2 rounded-lg bg-[#f8f8f3] p-4">
      {analytics.days.map((day) => (
        <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-md bg-[#173c2b]" style={{ height: `${(day.calories / max) * 100}%` }} />
          <span className="text-[10px] font-bold text-[#5f675f]">{day.date}</span>
        </div>
      ))}
    </div>
  );
}
