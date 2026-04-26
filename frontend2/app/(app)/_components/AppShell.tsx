"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Barbell,
  Camera,
  ChartBar,
  ForkKnife,
  Gear,
  House,
  Sparkle,
  Star,
  Trophy,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { getDailySummary } from "@/lib/api/meals";
import { getProfile } from "@/lib/api/profile";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/snap", label: "Log Meal", icon: Camera },
  { href: "/coach", label: "Coach", icon: Sparkle },
  { href: "/recommendations", label: "Recs", icon: Star },
  { href: "/meals", label: "Meals", icon: ForkKnife },
  { href: "/analytics", label: "Analytics", icon: ChartBar },
  { href: "/family", label: "Family", icon: UsersThree },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/weight", label: "Weight", icon: Barbell },
  { href: "/settings", label: "Settings", icon: Gear },
] as const;

const mobileNav = nav.slice(0, 5);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [totals, setTotals] = useState({ calories: 0, protein: 0 });
  const [targets, setTargets] = useState({ calories: 0, protein: 0 });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getDailySummary(new Date().toISOString().slice(0, 10)),
      getProfile().catch(() => null),
    ])
      .then(([daily, profile]) => {
        if (cancelled) return;
        setTotals({
          calories: Math.round(daily.totalCalories),
          protein: Math.round(daily.totalProtein),
        });
        if (profile) {
          setTargets({
            calories: profile.dailyCalorieTarget ?? 0,
            protein: profile.proteinTargetG ?? 0,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = useMemo(() => ({
    calories: Math.max(0, targets.calories - totals.calories),
    protein: Math.max(0, targets.protein - totals.protein),
  }), [targets, totals]);

  return (
    <div className="min-h-screen bg-[#f1f4f1] text-foreground selection:bg-teal/10">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[300px] border-r border-border bg-surface lg:flex lg:flex-col shadow-sm">
        <div className="flex h-24 items-center px-10">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-white shadow-premium transition-transform group-hover:scale-110">
              <ForkKnife size={22} weight="bold" />
            </span>
            <span>
              <span className="block text-[20px] font-bold tracking-tight text-forest">NutriAI</span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-teal/80">Premium Elite</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-10 custom-scrollbar">
          <div className="mb-6 px-4 text-[11px] font-bold uppercase tracking-[0.25em] text-muted opacity-50">
            Navigation
          </div>
          <ul className="space-y-2.5">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      "flex items-center gap-4 rounded-2xl px-5 py-4 text-[15px] font-bold transition-all duration-300",
                      active
                        ? "bg-forest text-white shadow-premium translate-x-1"
                        : "text-muted hover:bg-surface-alt hover:text-forest hover:translate-x-1",
                    ].join(" ")}
                  >
                    <Icon size={22} weight={active ? "fill" : "bold"} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6">
          <div className="rounded-[24px] bg-white p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Daily Target</p>
              <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-bold text-forest">{remaining.calories}</span>
              <span className="text-[13px] font-bold text-muted uppercase">kcal left</span>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/recommendations" className="rounded-xl bg-surface-alt py-3 text-center text-[13px] font-bold text-forest transition-colors hover:bg-forest hover:text-white">
                View Recommendations
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <main className="pb-24 lg:ml-[300px] lg:pb-0 min-h-screen">
        <div className="mx-auto max-w-[1600px] w-full">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 glass border-t border-border px-3 py-3 lg:hidden">
        <div className="grid grid-cols-5 gap-2">
          {mobileNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex h-12 flex-col items-center justify-center gap-1 rounded-xl transition-all",
                  active ? "bg-forest text-white shadow-premium" : "text-muted",
                ].join(" ")}
              >
                <Icon size={20} weight={active ? "fill" : "bold"} />
                <span className="text-[10px] font-bold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
