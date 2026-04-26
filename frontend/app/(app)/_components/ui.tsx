import Link from "next/link";
import { ArrowRight, Check, ForkKnife } from "@phosphor-icons/react/dist/ssr";

export type Meal = {
  id: string;
  mealType: string;
  title: string;
  loggedAt: string;
  source: "TEXT" | "IMAGE";
  provider: string;
  cached: boolean;
  confidence: number;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  items: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
  }>;
};

function safeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-teal">{eyebrow}</p>
        <h1 className="mt-2 text-[38px] font-bold tracking-tight text-forest md:text-[48px] leading-[1.1]">{title}</h1>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 text-[14px] font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
        >
          {action.label}
          <ArrowRight size={16} weight="bold" />
        </Link>
      ) : null}
    </header>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface shadow-md transition-shadow hover:shadow-lg ${className}`}>
      {children}
    </section>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Panel className="p-6">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-3 flex items-baseline gap-1">
        <p className="text-[34px] font-bold tracking-tight text-forest leading-none">{value}</p>
      </div>
      {sub ? <p className="mt-2 text-[12px] font-medium text-muted/80">{sub}</p> : null}
    </Panel>
  );
}

export function BudgetBar({
  label,
  value,
  target,
  unit,
  tone = "forest",
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  tone?: "forest" | "teal" | "sage" | "amber";
}) {
  const safeValue = safeNumber(value);
  const safeTarget = safeNumber(target);
  const pct =
    safeTarget > 0 ? Math.min(100, Math.round((safeValue / safeTarget) * 100)) : 0;
  const colors = {
    forest: "bg-forest",
    teal: "bg-teal",
    sage: "bg-sage",
    amber: "bg-[#b7791f]",
  };

  return (
    <div className="group">
      <div className="mb-2.5 flex justify-between text-[13px]">
        <span className="font-bold text-forest">{label}</span>
        <span className="font-medium text-muted">
          <span className="text-forest font-bold">{safeValue}</span>
          {unit} / {safeTarget}
          {unit}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colors[tone]}`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}

export function MealLine({ meal, expanded = false, action }: { meal: Meal; expanded?: boolean; action?: React.ReactNode }) {
  return (
    <div className="group/meal rounded-xl border border-border bg-surface-alt transition-all hover:border-teal/20 hover:shadow-md">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-forest shadow-sm transition-colors group-hover/meal:bg-forest group-hover/meal:text-white">
            <ForkKnife size={17} weight="bold" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold">{meal.title}</p>
            <p className="mt-1 text-[12px] text-muted">
              {meal.loggedAt} · {meal.mealType.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="grid grid-cols-4 gap-3 text-right text-[12px]">
            <span><b className="block text-[14px] text-[#101510]">{meal.totals.calories}</b>kcal</span>
            <span><b className="block text-[14px] text-[#101510]">{meal.totals.protein}g</b>pro</span>
            <span className="hidden sm:block"><b className="block text-[14px] text-[#101510]">{meal.totals.carbs}g</b>carb</span>
            <span className="hidden sm:block"><b className="block text-[14px] text-[#101510]">{meal.totals.fat}g</b>fat</span>
          </div>
          {action}
        </div>
      </div>
      {expanded ? (
        <div className="border-t border-border px-4 pb-4">
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-white">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-surface-alt text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Item</th>
                  <th className="px-3 py-2 font-semibold">Qty</th>
                  <th className="px-3 py-2 text-right font-semibold">kcal</th>
                  <th className="px-3 py-2 text-right font-semibold">conf.</th>
                </tr>
              </thead>
              <tbody>
                {meal.items.map((item) => (
                  <tr key={item.name} className="border-t border-border">
                    <td className="px-3 py-2 font-semibold">{item.name}</td>
                    <td className="px-3 py-2 text-[#5f675f]">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{item.calories}</td>
                    <td className="px-3 py-2 text-right">{Math.round(item.confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SourceBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-bold text-muted">
      {label}
    </span>
  );
}

export function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-alt p-3.5 transition-all hover:border-teal/20 hover:shadow-sm">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-lime shadow-sm">
        <Check size={14} weight="bold" />
      </span>
      <p className="text-[13px] font-semibold">{children}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-forest/5 ${className}`} />
  );
}

export function StatSkeleton() {
  return (
    <Panel className="p-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-4 h-10 w-32" />
      <Skeleton className="mt-3 h-3 w-24" />
    </Panel>
  );
}
