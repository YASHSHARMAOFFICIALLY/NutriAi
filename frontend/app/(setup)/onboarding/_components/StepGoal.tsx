import { Barbell, ArrowsClockwise, TrendDown, Leaf } from "@phosphor-icons/react/dist/ssr";

const GOALS = [
  { id: "lose",     label: "Lose weight",    sub: "Caloric deficit, steady progress", icon: <TrendDown size={20} weight="fill" /> },
  { id: "maintain", label: "Maintain weight", sub: "Stay at your current weight",     icon: <ArrowsClockwise size={20} weight="fill" /> },
  { id: "muscle",   label: "Build muscle",    sub: "High protein, slight surplus",    icon: <Barbell size={20} weight="fill" /> },
  { id: "health",   label: "Eat healthier",   sub: "Better habits, whole foods",      icon: <Leaf size={20} weight="fill" /> },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function StepGoal({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {GOALS.map((g) => (
        <button
          key={g.id}
          onClick={() => onChange(g.id)}
          className={[
            "flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200",
            value === g.id
              ? "border-forest bg-forest text-cream shadow-[0_4px_20px_rgba(31,59,45,0.25)]"
              : "border-white/70 bg-white/60 text-ink hover:border-sage/40 hover:bg-white/80",
          ].join(" ")}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${value === g.id ? "bg-white/15" : "bg-ink/[0.05]"}`}>
            {g.icon}
          </span>
          <div>
            <p className="text-[15px] font-semibold">{g.label}</p>
            <p className={`text-[12px] ${value === g.id ? "text-white/65" : "text-ink-muted"}`}>{g.sub}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
