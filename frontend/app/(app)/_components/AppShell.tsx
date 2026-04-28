"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AddressBook,
  Barbell,
  Camera,
  ChartBar,
  ForkKnife,
  Gear,
  House,
  Medal,
  SidebarSimple,
  Sparkle,
  Star,
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
  { href: "/family", label: "Family", icon: AddressBook },
  { href: "/challenges", label: "Challenges", icon: Medal },
  { href: "/weight", label: "Weight", icon: Barbell },
  { href: "/settings", label: "Settings", icon: Gear },
] as const;

const mobileNav = nav.slice(0, 5);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [totals, setTotals] = useState({ calories: 0, protein: 0 });
  const [targets, setTargets] = useState({ calories: 0, protein: 0 });
  const [expanded, setExpanded] = useState(false);

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
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-white/92 shadow-sm backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex lg:flex-col ${expanded ? "w-[248px]" : "w-[86px]"}`}
      >
        <div className={`flex h-20 items-center border-b border-border px-5 ${expanded ? "justify-between" : "justify-center"}`}>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3 group" aria-label="NutriAI dashboard">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest text-white shadow-premium transition-transform group-hover:scale-105">
              <ForkKnife size={22} weight="bold" />
            </span>
            <span className={`overflow-hidden transition-all duration-300 ${expanded ? "w-28 opacity-100" : "w-0 opacity-0"}`}>
              <span className="block whitespace-nowrap text-[17px] font-bold tracking-tight text-forest">NutriAI</span>
              <span className="block whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.14em] text-teal/80">Workspace</span>
            </span>
          </Link>
          {expanded ? (
            <button
              onClick={() => setExpanded((current) => !current)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface-alt text-muted transition-colors hover:text-forest"
              aria-label="Toggle sidebar"
            >
              <SidebarSimple size={17} weight="bold" />
            </button>
          ) : null}
        </div>

        <nav className="custom-scrollbar flex-1 overflow-y-auto overscroll-contain px-3 py-5">
          <div className={`mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted/50 transition-opacity ${expanded ? "opacity-100" : "opacity-0"}`}>
            Navigation
          </div>
          <ul className="space-y-1.5">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={label}
                    className={[
                      "group/nav relative flex h-11 items-center rounded-2xl text-[13px] font-bold transition-all duration-300",
                      expanded ? "gap-3 px-3" : "justify-center px-0",
                      active
                        ? "bg-forest text-white shadow-premium"
                        : "text-muted hover:bg-surface-alt hover:text-forest",
                    ].join(" ")}
                  >
                    <Icon size={19} weight={active ? "fill" : "bold"} />
                    <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${expanded ? "w-36 opacity-100" : "w-0 opacity-0"}`}>{label}</span>
                    {!expanded ? (
                      <span className="pointer-events-none absolute left-[64px] z-50 rounded-xl border border-border bg-white px-3 py-2 text-[12px] font-bold text-forest opacity-0 shadow-lg transition-opacity group-hover/nav:opacity-100">
                        {label}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <div className={`overflow-hidden rounded-2xl border border-border bg-surface-alt shadow-sm transition-all duration-300 ${expanded ? "p-4" : "p-2"}`}>
            <div className={`mb-3 flex items-center ${expanded ? "justify-between" : "justify-center"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider text-muted transition-all ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>Daily target</p>
              <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
            </div>
            <div className={`flex items-baseline gap-1 ${expanded ? "" : "justify-center"}`}>
              <span className="text-[20px] font-bold text-forest">{remaining.calories}</span>
              <span className={`text-[11px] font-bold uppercase text-muted transition-all ${expanded ? "w-auto opacity-100" : "w-0 overflow-hidden opacity-0"}`}>kcal left</span>
            </div>
            <div className={`mt-4 flex flex-col gap-3 transition-all ${expanded ? "max-h-20 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
              <Link href="/recommendations" className="rounded-xl bg-white py-3 text-center text-[12px] font-bold text-forest transition-colors hover:bg-forest hover:text-white">
                View Recommendations
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen pb-24 transition-[margin] duration-300 ease-out lg:ml-[86px] lg:pb-0">
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
