import Link from "next/link";
import type { ComponentType } from "react";
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
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal">{eyebrow}</p>
        <h1 className="mt-2 text-[32px] font-bold leading-[1.08] tracking-tight text-forest md:text-[42px]">{title}</h1>
        {description ? <p className="mt-3 text-[14px] leading-6 text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-[14px] font-bold text-white transition-colors hover:bg-forest-soft"
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
    <section className={`rounded-lg border border-border bg-surface shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "forest",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "forest" | "teal" | "sage" | "amber";
}) {
  const tones = {
    forest: "border-t-forest",
    teal: "border-t-teal",
    sage: "border-t-sage",
    amber: "border-t-[#b7791f]",
  };

  return (
    <Panel className={`border-t-4 p-5 ${tones[tone]}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-3 flex items-baseline gap-1">
        <p className="text-[30px] font-bold leading-none tracking-tight text-forest">{value}</p>
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
      <div className="h-2 overflow-hidden rounded-full bg-surface-alt">
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
    <div className="group/meal rounded-lg border border-border bg-surface-alt transition-colors hover:border-teal/25">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-forest shadow-sm transition-colors group-hover/meal:bg-forest group-hover/meal:text-white">
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
            <div className="grid grid-cols-2 gap-3 text-right text-[12px] sm:grid-cols-4">
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
          <div className="mt-3 overflow-hidden rounded-lg border border-border bg-white">
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
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-alt p-3.5 transition-colors hover:border-teal/25">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-lime shadow-sm">
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

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  secondaryAction,
}: {
  icon: ComponentType<{ size?: number; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }>;
  title: string;
  description: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-alt/60 px-6 py-12 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-lg bg-white text-muted shadow-sm">
        <IconComponent size={28} weight="duotone" />
      </div>
      <h3 className="text-[16px] font-bold text-forest">{title}</h3>
      <p className="mt-2 max-w-sm text-[13px] leading-6 text-muted">{description}</p>
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {action && (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-forest-soft"
            >
              {action.label}
              <ArrowRight size={14} weight="bold" />
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center rounded-lg border border-border bg-white px-5 py-2.5 text-[13px] font-bold text-forest transition-colors hover:bg-surface-alt"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
