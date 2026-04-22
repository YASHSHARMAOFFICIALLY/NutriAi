import Link from "next/link";
import { ArrowRight, Check, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import type { Meal } from "./mock-data";

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
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0f8b8d]">{eyebrow}</p>
        <h1 className="mt-1 text-[34px] font-semibold leading-[1.04] md:text-[42px]">{title}</h1>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#173c2b] px-4 py-2.5 text-[14px] font-semibold text-white"
        >
          {action.label}
          <ArrowRight size={14} weight="bold" />
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
    <section className={`rounded-lg border border-black/10 bg-white shadow-[0_10px_30px_rgba(16,21,16,0.05)] ${className}`}>
      {children}
    </section>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Panel className="p-4">
      <p className="text-[12px] font-semibold text-[#5f675f]">{label}</p>
      <p className="mt-2 text-[30px] font-semibold leading-none">{value}</p>
      {sub ? <p className="mt-2 text-[12px] text-[#5f675f]">{sub}</p> : null}
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
  const pct = Math.min(100, Math.round((value / target) * 100));
  const color = {
    forest: "#173c2b",
    teal: "#0f8b8d",
    sage: "#5f8f72",
    amber: "#b7791f",
  }[tone];

  return (
    <div>
      <div className="mb-2 flex justify-between text-[13px]">
        <span className="font-semibold">{label}</span>
        <span className="text-[#5f675f]">
          {value}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-black/8">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function MealLine({ meal, expanded = false, action }: { meal: Meal; expanded?: boolean; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-black/8 bg-[#f8f8f3]">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white text-[#173c2b]">
            <ForkKnife size={17} weight="bold" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold">{meal.title}</p>
            <p className="mt-1 text-[12px] text-[#5f675f]">
              {meal.loggedAt} · {meal.mealType.toLowerCase()} · {meal.source.toLowerCase()}
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
        <div className="border-t border-black/8 px-4 pb-4">
          <div className="mt-3 overflow-hidden rounded-md border border-black/8 bg-white">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#eef5f2] text-[#5f675f]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Item</th>
                  <th className="px-3 py-2 font-semibold">Qty</th>
                  <th className="px-3 py-2 text-right font-semibold">kcal</th>
                  <th className="px-3 py-2 text-right font-semibold">conf.</th>
                </tr>
              </thead>
              <tbody>
                {meal.items.map((item) => (
                  <tr key={item.name} className="border-t border-black/6">
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
    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-bold text-[#5f675f]">
      {label}
    </span>
  );
}

export function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-black/8 bg-[#f8f8f3] p-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#d7ff68]">
        <Check size={14} weight="bold" />
      </span>
      <p className="text-[13px] font-semibold">{children}</p>
    </div>
  );
}
