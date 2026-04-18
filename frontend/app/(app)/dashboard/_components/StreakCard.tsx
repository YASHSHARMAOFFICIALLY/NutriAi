import { Flame } from "@phosphor-icons/react/dist/ssr";

const STREAK = 12;
const PAST_WEEK = [true, true, false, true, true, true, true] as const;

export function StreakCard() {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_10px_40px_rgba(31,59,45,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2">
        <Flame size={14} weight="fill" className="text-orange-400" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
          Streak
        </p>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-5xl font-bold leading-none text-ink">
          {STREAK}
        </span>
        <span className="text-[14px] text-ink-muted">days in a row</span>
      </div>

      {/* Week dots */}
      <div className="mt-5 flex gap-1.5">
        {PAST_WEEK.map((logged, i) => {
          const isToday = i === PAST_WEEK.length - 1;
          return (
            <div
              key={i}
              title={isToday ? "Today" : undefined}
              className={[
                "h-2 flex-1 rounded-full",
                isToday && logged ? "bg-forest" : logged ? "bg-sage" : "bg-ink/[0.08]",
              ].join(" ")}
            />
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-ink-muted/60">Past 7 days</p>
    </div>
  );
}
