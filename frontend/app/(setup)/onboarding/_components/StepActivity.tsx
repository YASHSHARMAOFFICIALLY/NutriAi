const LEVELS = [
  { id: "sedentary",  label: "Sedentary",         sub: "Desk job, little to no exercise" },
  { id: "light",      label: "Lightly active",     sub: "Exercise 1–3 days / week" },
  { id: "moderate",   label: "Moderately active",  sub: "Exercise 3–5 days / week" },
  { id: "very",       label: "Very active",         sub: "Hard exercise 6–7 days / week" },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function StepActivity({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {LEVELS.map((l, i) => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={[
            "flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200",
            value === l.id
              ? "border-forest bg-forest text-cream shadow-[0_4px_20px_rgba(31,59,45,0.25)]"
              : "border-white/70 bg-white/60 text-ink hover:border-sage/40 hover:bg-white/80",
          ].join(" ")}
        >
          <div>
            <p className="text-[15px] font-semibold">{l.label}</p>
            <p className={`text-[12px] ${value === l.id ? "text-white/65" : "text-ink-muted"}`}>{l.sub}</p>
          </div>
          {/* Activity visual bar */}
          <div className="flex items-end gap-0.5 ml-4">
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={`w-2 rounded-sm transition-colors ${bar <= i + 1 ? (value === l.id ? "bg-white/60" : "bg-forest/50") : "bg-ink/[0.08]"}`}
                style={{ height: bar * 6 }}
              />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
