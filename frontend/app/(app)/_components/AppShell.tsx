"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AddressBook,
  Barbell,
  Camera,
  ChartBar,
  CrownSimple,
  DotsThree,
  ForkKnife,
  Gear,
  House,
  Medal,
  ShieldCheck,
  SidebarSimple,
  Sparkle,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { useMe, usePlan, useDailySummary, useProfile } from "@/lib/hooks/swr";

const baseNav = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: House },
  { href: "/snap", label: "Log Meal", shortLabel: "Log", icon: Camera },
  { href: "/coach", label: "Coach", shortLabel: "Coach", icon: Sparkle },
  { href: "/recommendations", label: "Next Meal", shortLabel: "Ideas", icon: Star },
  { href: "/meals", label: "Meals", shortLabel: "Meals", icon: ForkKnife },
  { href: "/analytics", label: "Progress", shortLabel: "Stats", icon: ChartBar },
  { href: "/family", label: "Family", shortLabel: "Family", icon: AddressBook },
  { href: "/challenges", label: "Challenges", shortLabel: "Goals", icon: Medal },
  { href: "/weight", label: "Weight", shortLabel: "Weight", icon: Barbell },
  { href: "/settings", label: "Account", shortLabel: "Account", icon: Gear },
] as const;

const adminNavItem = { href: "/admin", label: "Admin", shortLabel: "Admin", icon: ShieldCheck } as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const { data: me } = useMe();
  const { data: plan } = usePlan();
  const { data: daily } = useDailySummary();
  const { data: profile } = useProfile();

  const isAdmin = me?.role === "ADMIN";
  const isPro = plan?.tier === "PRO" && (plan.status === "ACTIVE" || plan.status === "PAST_DUE");
  const totals = {
    calories: Math.round(daily?.totalCalories ?? 0),
    protein: Math.round(daily?.totalProtein ?? 0),
  };
  const targets = {
    calories: profile?.dailyCalorieTarget ?? 0,
    protein: profile?.proteinTargetG ?? 0,
  };

  const nav = useMemo(() => isAdmin ? [...baseNav, adminNavItem] : baseNav, [isAdmin]);
  const mobileNav = useMemo(() => nav.slice(0, 4), [nav]);
  const moreNav = useMemo(() => nav.slice(4), [nav]);

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
              <span className="flex items-center gap-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.14em] text-teal/80">
                {isPro ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#d7ff68] px-2 py-0.5 text-[9px] font-bold text-forest">
                    <CrownSimple size={10} weight="fill" />
                    PRO
                  </span>
                ) : "Workspace"}
              </span>
            </span>
          </Link>
          {expanded ? (
            <button
              onClick={() => setExpanded((current) => !current)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-alt text-muted transition-colors hover:text-forest"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
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
                      "group/nav relative flex h-11 items-center rounded-lg text-[13px] font-bold transition-all duration-300",
                      expanded ? "gap-3 px-3" : "justify-center px-0",
                      active
                        ? "bg-forest text-white shadow-premium"
                        : href === "/snap"
                          ? "bg-lime/45 text-forest hover:bg-lime"
                          : "text-muted hover:bg-surface-alt hover:text-forest",
                    ].join(" ")}
                  >
                    <Icon size={19} weight={active ? "fill" : "bold"} />
                    <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${expanded ? "w-36 opacity-100" : "w-0 opacity-0"}`}>{label}</span>
                    {!expanded ? (
                      <span className="pointer-events-none absolute left-[64px] z-50 rounded-lg border border-border bg-white px-3 py-2 text-[12px] font-bold text-forest opacity-0 shadow-lg transition-opacity group-hover/nav:opacity-100">
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
          <div className={`overflow-hidden rounded-lg border border-border bg-surface-alt shadow-sm transition-all duration-300 ${expanded ? "p-4" : "p-2"}`}>
            <div className={`mb-3 flex items-center ${expanded ? "justify-between" : "justify-center"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider text-muted transition-all ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>Daily target</p>
              <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
            </div>
            <div className={`flex items-baseline gap-1 ${expanded ? "" : "justify-center"}`}>
              <span className="text-[20px] font-bold text-forest">{remaining.calories}</span>
              <span className={`text-[11px] font-bold uppercase text-muted transition-all ${expanded ? "w-auto opacity-100" : "w-0 overflow-hidden opacity-0"}`}>kcal left</span>
            </div>
            <div className={`mt-4 flex flex-col gap-3 transition-all ${expanded ? "max-h-32 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
              <Link href="/recommendations" className="rounded-lg bg-white py-3 text-center text-[12px] font-bold text-forest transition-colors hover:bg-forest hover:text-white">
                View Recommendations
              </Link>
              {!isPro && (
                <Link href="/pricing" className="flex items-center justify-center gap-1.5 rounded-lg bg-[#d7ff68] py-3 text-center text-[12px] font-bold text-forest transition-colors hover:bg-[#c8f050]">
                  <CrownSimple size={14} weight="fill" />
                  Upgrade to Pro
                </Link>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom))] transition-[margin] duration-300 ease-out lg:ml-[86px] lg:pb-0">
        <header className="sticky top-0 z-30 border-b border-border bg-white/94 px-4 py-2.5 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-3" aria-label="NutriAI dashboard">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-forest text-white shadow-sm">
                <ForkKnife size={20} weight="bold" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[16px] font-bold text-forest">NutriAI</span>
                <span className="block truncate text-[11px] font-semibold text-muted">
                  {targets.calories > 0 ? `${remaining.calories} kcal left today` : "Set targets for daily guidance"}
                </span>
              </span>
            </Link>
            <Link
              href="/snap"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-lime px-3 text-[13px] font-bold text-forest shadow-sm"
            >
              <Camera size={16} weight="bold" />
              Scan
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-[1600px] w-full">
          {children}
        </div>
      </main>

      {moreOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] max-h-[62dvh] overflow-y-auto rounded-lg border border-border bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted">More</p>
              <button onClick={() => setMoreOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg bg-surface-alt text-[18px] font-bold leading-none text-muted" aria-label="Close more menu">
                &times;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
              {[...moreNav, { href: "/pricing", label: "Pricing", shortLabel: "Pricing", icon: CrownSimple }].map(({ href, shortLabel, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={[
                      "flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg p-3 text-center text-[12px] font-bold transition-all",
                      active ? "bg-forest text-white" : "bg-surface-alt text-muted hover:text-forest",
                    ].join(" ")}
                  >
                    <Icon size={22} weight={active ? "fill" : "bold"} />
                    {shortLabel}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 glass border-t border-border px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 lg:hidden">
        <div className="grid grid-cols-5 gap-2">
          {mobileNav.map(({ href, label, shortLabel, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={[
                  "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg transition-all",
                  active ? "bg-forest text-white shadow-premium" : "text-muted",
                ].join(" ")}
              >
                <Icon size={21} weight={active ? "fill" : "bold"} />
                <span className="max-w-full truncate px-1 text-[10px] font-bold">{shortLabel}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            aria-label="Open more navigation"
            className={[
              "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg transition-all",
              moreOpen || moreNav.some((n) => pathname === n.href)
                ? "bg-forest text-white shadow-premium"
                : "text-muted",
            ].join(" ")}
          >
            <DotsThree size={20} weight="bold" />
            <span className="text-[10px] font-bold">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
