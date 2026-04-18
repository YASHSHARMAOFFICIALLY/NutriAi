import React from "react";

export interface CardData {
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
  titleColor?: string;
}

function Card({
  icon,
  title,
  description,
  meta,
  titleColor = "text-sage",
  className = "",
}: CardData & { className?: string }) {
  return (
    <div
      className={[
        "relative flex h-28 w-72 -skew-y-[8deg] select-none flex-col justify-between",
        "rounded-xl px-4 py-3",
        "bg-white/10 backdrop-blur-md",
        "border border-white/[0.14]",
        "shadow-[0_8px_32px_rgba(0,15,8,0.35)]",
        "transition-all duration-700",
        "hover:bg-white/[0.15] hover:border-white/25 hover:shadow-[0_16px_48px_rgba(0,15,8,0.55)]",
        // gradient fade — right edge dissolves into dark hero bg
        "after:absolute after:top-[-5%] after:-right-1 after:h-[110%] after:w-36",
        "after:bg-linear-to-l after:from-[#0B1E12] after:to-transparent",
        "after:pointer-events-none after:content-['']",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center rounded-full bg-white/10 border border-white/20 p-1.5">
          {icon}
        </span>
        <p className={`text-sm font-semibold leading-none ${titleColor}`}>{title}</p>
      </div>
      <p className="text-sm leading-snug text-white/75">{description}</p>
      <p className="text-[11px] text-white/40">{meta}</p>
    </div>
  );
}

export function DisplayCards({ cards }: { cards: CardData[] }) {
  const [front, mid, back] = cards;
  return (
    <div className="grid [grid-template-areas:'stack'] place-items-start">
      {front && (
        <Card
          {...front}
          className="[grid-area:stack] hover:-translate-y-10"
        />
      )}
      {mid && (
        <Card
          {...mid}
          className="[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1"
        />
      )}
      {back && (
        <Card
          {...back}
          className="[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10"
        />
      )}
    </div>
  );
}
