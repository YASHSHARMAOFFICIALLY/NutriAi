import { Sparkle, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function CoachCard() {
  return (
    <div className="flex flex-col rounded-3xl bg-forest p-6 shadow-[0_16px_48px_rgba(31,59,45,0.2)]">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sage/30 bg-sage/20">
          <Sparkle size={13} weight="fill" className="text-sage" />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-sage">Coach Ria</p>
          <p className="text-[10px] text-white/35">AI Nutritionist</p>
        </div>
      </div>

      {/* Message */}
      <p className="mt-5 text-[14px] leading-[1.6] text-white/75">
        You&apos;re 46g short on protein today. Add a 5oz salmon fillet at dinner — it closes the gap and keeps fat in range.
      </p>

      {/* CTA */}
      <a
        href="/coach"
        className="mt-6 flex items-center gap-1.5 self-start text-[13px] font-semibold text-sage transition-opacity hover:opacity-75"
      >
        Chat with Ria
        <ArrowRight size={13} weight="bold" />
      </a>
    </div>
  );
}
