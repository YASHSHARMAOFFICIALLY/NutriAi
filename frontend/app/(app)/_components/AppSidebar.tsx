"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Camera,
  Sparkle,
  ChartBar,
  ForkKnife,
  Star,
  Trophy,
  Gear,
} from "@phosphor-icons/react/dist/ssr";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",  icon: SquaresFour },
  { href: "/snap",        label: "Snap & Log",  icon: Camera },
  { href: "/coach",       label: "Coach Ria",   icon: Sparkle },
  { href: "/analytics",   label: "Analytics",   icon: ChartBar },
  { href: "/meals",       label: "Meals",        icon: ForkKnife },
  { href: "/challenges",  label: "Challenges",   icon: Trophy },
  { href: "/recommendations", label: "For You", icon: Star },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-ink/[0.06] bg-cream/90 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-ink/[0.06] px-6">
        <Link href="/dashboard" className="font-display text-[19px] font-bold tracking-tight text-ink">
          NutriAI
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-150",
                    active
                      ? "bg-forest text-cream shadow-[0_2px_8px_rgba(31,59,45,0.2)]"
                      : "text-ink-muted hover:bg-ink/[0.05] hover:text-ink",
                  ].join(" ")}
                >
                  <Icon size={17} weight={active ? "fill" : "regular"} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-ink/[0.06] p-3">
        <Link
          href="/settings"
          className={[
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-150",
            pathname === "/settings"
              ? "bg-forest text-cream"
              : "text-ink-muted hover:bg-ink/[0.05] hover:text-ink",
          ].join(" ")}
        >
          <Gear size={17} weight={pathname === "/settings" ? "fill" : "regular"} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
