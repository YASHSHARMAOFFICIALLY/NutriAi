"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "@phosphor-icons/react/dist/ssr";
import { logout } from "@/lib/api/account";
import { getDailySummary } from "@/lib/api/meals";
import { getProfile } from "@/lib/api/profile";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/snap", label: "Log Meal", icon: Camera },
  { href: "/coach", label: "Coach", icon: Sparkle },
  { href: "/recommendations", label: "Recs", icon: Star },
  { href: "/meals", label: "Meals", icon: ForkKnife },
  { href: "/analytics", label: "Analytics", icon: ChartBar },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/weight", label: "Weight", icon: Barbell },
  { href: "/settings", label: "Settings", icon: Gear },
] as const;

const mobileNav = nav.slice(0, 5);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [totals, setTotals] = useState({ calories: 0, protein: 0 });
  const [targets, setTargets] = useState({ calories: 2150, protein: 150 });
  const [source, setSource] = useState<"live" | "fallback">("fallback");

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
            calories: profile.dailyCalorieTarget ?? 2150,
            protein: profile.proteinTargetG ?? 150,
          });
        }
        setSource("live");
      })
      .catch(() => setSource("fallback"));
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = useMemo(() => ({
    calories: Math.max(0, targets.calories - totals.calories),
    protein: Math.max(0, targets.protein - totals.protein),
  }), [targets, totals]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#f8f8f3] text-[#101510]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-black/10 bg-[#f8f8f3]/88 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex h-18 items-center border-b border-black/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#173c2b] text-white">
              <ForkKnife size={18} weight="bold" />
            </span>
            <span>
              <span className="block text-[17px] leading-none">NutriAI</span>
              <span className="mt-1 block text-[11px] font-medium text-[#5f675f]">Meals · targets · coach</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f675f]">
            Today
          </div>
          <ul className="space-y-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-semibold transition",
                      active
                        ? "bg-[#173c2b] text-white shadow-[0_10px_30px_rgba(23,60,43,0.18)]"
                        : "text-[#5f675f] hover:bg-white hover:text-[#101510]",
                    ].join(" ")}
                  >
                    <Icon size={18} weight={active ? "fill" : "regular"} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-black/10 p-4">
          <div className="rounded-xl bg-white p-4 shadow-[0_14px_40px_rgba(16,21,16,0.08)]">
            <p className="text-[12px] font-semibold text-[#5f675f]">Today · {source}</p>
            <p className="mt-2 text-[15px] font-semibold leading-5">{remaining.calories} kcal left · {remaining.protein}g protein gap.</p>
            <Link href="/recommendations" className="mt-4 inline-flex text-[12px] font-bold text-[#0f8b8d]">
              See meals
            </Link>
            <button onClick={handleLogout} className="mt-3 block text-[12px] font-bold text-[#b7791f]">
              Logout
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f8f8f3]/86 px-5 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[#173c2b] text-white">
              <ForkKnife size={16} weight="bold" />
            </span>
            NutriAI
          </Link>
          <Link href="/snap" className="rounded-md bg-[#d7ff68] px-4 py-2 text-[13px] font-bold text-[#101510]">
            Log meal
          </Link>
          <button onClick={handleLogout} className="rounded-md border border-black/10 px-3 py-2 text-[12px] font-bold text-[#5f675f]">
            Logout
          </button>
        </div>
      </header>

      <main className="pb-24 lg:ml-[264px] lg:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-[#f8f8f3]/92 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold",
                  active ? "bg-[#173c2b] text-white" : "text-[#5f675f]",
                ].join(" ")}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
