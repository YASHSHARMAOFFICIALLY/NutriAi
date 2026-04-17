import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  /** Controls the visual weight. `bento` is for feature cells; `plain` is for inline blocks. */
  variant?: "bento" | "plain";
};

const BASE =
  "relative overflow-hidden rounded-3xl border border-white/60 " +
  "bg-white/55 backdrop-blur-xl " +
  // inset highlight at the top + soft sunk shadow at the bottom-inside,
  // then a very gentle outer lift so cards hover off the cream bg.
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-10px_22px_rgba(31,59,45,0.05),0_14px_40px_rgba(31,59,45,0.08)]";

const VARIANTS = {
  bento: "p-7 md:p-8",
  plain: "p-5",
} as const;

export function GlassCard({ children, className = "", variant = "bento" }: GlassCardProps) {
  return <div className={`${BASE} ${VARIANTS[variant]} ${className}`}>{children}</div>;
}
