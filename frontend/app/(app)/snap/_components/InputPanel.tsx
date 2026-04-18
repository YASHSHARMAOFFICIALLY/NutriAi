import { Camera, TextT, ArrowRight } from "@phosphor-icons/react/dist/ssr";

interface Props {
  query: string;
  tab: "describe" | "photo";
  onQueryChange: (v: string) => void;
  onTabChange: (t: "describe" | "photo") => void;
  onAnalyze: () => void;
}

const EXAMPLES = [
  "Grilled chicken breast with rice and broccoli",
  "Large bowl of oatmeal with banana and honey",
  "Caesar salad with croutons and parmesan",
];

export function InputPanel({ query, tab, onQueryChange, onTabChange, onAnalyze }: Props) {
  const canAnalyze = tab === "describe" ? query.trim().length > 2 : true;

  return (
    <div className="flex flex-col gap-5">
      {/* Tab toggle */}
      <div className="flex self-start rounded-full border border-ink/[0.08] bg-white/60 p-1 backdrop-blur-sm">
        {(["describe", "photo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={[
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200",
              tab === t
                ? "bg-forest text-cream shadow-[0_2px_8px_rgba(31,59,45,0.2)]"
                : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            {t === "describe" ? (
              <TextT size={14} weight={tab === t ? "fill" : "regular"} />
            ) : (
              <Camera size={14} weight={tab === t ? "fill" : "regular"} />
            )}
            {t === "describe" ? "Describe" : "Upload photo"}
          </button>
        ))}
      </div>

      {tab === "describe" ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="e.g. grilled salmon with brown rice and mixed greens"
            rows={4}
            className="w-full resize-none rounded-2xl border border-ink/[0.08] bg-white/70 px-5 py-4 text-[15px] text-ink placeholder-ink-muted/50 shadow-[inset_0_1px_3px_rgba(31,59,45,0.05)] backdrop-blur-sm outline-none transition-all focus:border-sage/60 focus:bg-white/90 focus:shadow-[inset_0_1px_3px_rgba(31,59,45,0.05),0_0_0_3px_rgba(127,166,135,0.12)]"
          />
          {/* Example prompts */}
          {query.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => onQueryChange(ex)}
                  className="rounded-full border border-ink/[0.07] bg-white/50 px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-sage/40 hover:text-sage-600"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ink/[0.1] bg-white/50 px-6 py-14 transition-colors hover:border-sage/40 hover:bg-white/70">
          <Camera size={28} className="text-ink-muted/50" />
          <div className="text-center">
            <p className="text-[14px] font-medium text-ink-muted">Drop a photo here</p>
            <p className="text-[12px] text-ink-muted/60">or click to browse — JPG, PNG, WEBP</p>
          </div>
          <input type="file" accept="image/*" className="sr-only" />
        </label>
      )}

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        disabled={!canAnalyze}
        className={[
          "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all duration-200",
          canAnalyze
            ? "bg-forest text-cream shadow-[0_4px_20px_rgba(31,59,45,0.25)] hover:opacity-90 hover:shadow-[0_8px_30px_rgba(31,59,45,0.32)] active:scale-[0.99]"
            : "cursor-not-allowed bg-ink/[0.06] text-ink-muted/50",
        ].join(" ")}
      >
        Analyze with AI
        <ArrowRight size={16} weight="bold" />
      </button>
    </div>
  );
}
