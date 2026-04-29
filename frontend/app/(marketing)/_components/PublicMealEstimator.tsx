"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { estimateMealPublic, type PublicEstimateResponse } from "@/lib/api/publicEstimate";

const examples = [
  "chicken burrito bowl with rice, beans, cheese, salsa and guacamole",
  "two rotis with dal, paneer sabzi and curd",
  "turkey sandwich with chips and a side salad",
  "paneer biryani with raita",
];

function round(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0);
}

export function PublicMealEstimator({
  compact = false,
  defaultMeal = "",
}: {
  compact?: boolean;
  defaultMeal?: string;
}) {
  const [text, setText] = useState(defaultMeal);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PublicEstimateResponse | null>(null);

  const canSubmit = text.trim().length > 3 && status !== "loading";
  const topItems = useMemo(() => result?.items.slice(0, compact ? 3 : 5) ?? [], [compact, result]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setError("");
    try {
      const estimate = await estimateMealPublic({ text: text.trim() });
      setResult(estimate);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not estimate this meal right now.");
      setStatus("error");
    }
  }

  return (
    <section id="estimate" className={compact ? "" : "bg-[#101510] px-5 py-20 text-white lg:px-8"}>
      <div className={compact ? "" : "mx-auto max-w-7xl"}>
        <div className={compact ? "rounded-xl border border-black/10 bg-white p-5 text-[#101510] shadow-[0_18px_48px_rgba(16,21,16,0.08)]" : "grid gap-8 rounded-xl border border-white/12 bg-white/8 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur lg:grid-cols-[0.82fr_1.18fr] lg:p-8"}>
          <div>
            <p className={compact ? "text-[12px] font-bold uppercase tracking-[0.16em] text-[#0f8b8d]" : "text-[12px] font-bold uppercase tracking-[0.16em] text-[#d7ff68]"}>
              Try without an account
            </p>
            <h2 className={compact ? "mt-3 text-[26px] font-bold leading-tight text-[#173c2b]" : "mt-4 text-[42px] font-semibold leading-tight"}>
              Estimate a meal before you sign up.
            </h2>
            <p className={compact ? "mt-3 text-[14px] leading-6 text-[#5f675f]" : "mt-4 max-w-xl text-[16px] leading-7 text-white/72"}>
              Type a real meal and get an editable calorie, protein, carb, and fat estimate. Save it after signup to track your full day.
            </p>
          </div>

          <div className={compact ? "mt-5" : ""}>
            <form onSubmit={submit} className="grid gap-3">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={compact ? 3 : 4}
                maxLength={280}
                placeholder="Example: chicken burrito bowl with rice, beans, cheese, salsa and guacamole"
                className="w-full resize-none rounded-lg border border-black/10 bg-white p-4 text-[15px] font-medium text-[#101510] outline-none transition focus:border-[#0f8b8d] focus:ring-4 focus:ring-[#0f8b8d]/10"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#d7ff68] px-5 text-[14px] font-bold text-[#101510] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <Sparkle size={16} weight="fill" />
                  {status === "loading" ? "Estimating..." : "Estimate meal"}
                </button>
                <button
                  type="button"
                  onClick={() => setText(examples[Math.floor(Math.random() * examples.length)])}
                  className={compact ? "rounded-lg border border-black/10 bg-[#f1f4f1] px-5 py-3 text-[14px] font-bold text-[#173c2b]" : "rounded-lg border border-white/16 bg-white/10 px-5 py-3 text-[14px] font-bold text-white transition hover:bg-white/16"}
                >
                  Use example
                </button>
              </div>
            </form>

            {status === "error" ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] font-semibold text-red-700">{error}</p>
            ) : null}

            {result ? (
              <div className="mt-5 rounded-lg border border-black/10 bg-white p-4 text-[#101510]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Estimated total</p>
                    <p className="mt-1 text-[30px] font-bold text-[#173c2b]">{round(result.totals.calories)} kcal</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#d7ff68]/70 px-3 py-1 text-[12px] font-bold text-[#101510]">
                    <CheckCircle size={14} weight="fill" />
                    {round(result.confidence * 100)}% confidence
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Protein", `${round(result.totals.protein)}g`],
                    ["Carbs", `${round(result.totals.carbs)}g`],
                    ["Fat", `${round(result.totals.fat)}g`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-[#f1f4f1] p-3">
                      <p className="text-[18px] font-bold text-[#173c2b]">{value}</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#5f675f]">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {topItems.map((item) => (
                    <div key={`${item.name}-${item.quantity}`} className="flex items-center justify-between gap-3 rounded-lg border border-black/8 p-3 text-[13px]">
                      <div>
                        <p className="font-bold text-[#173c2b]">{item.name}</p>
                        <p className="mt-0.5 text-[#5f675f]">{item.quantity || "estimated serving"}</p>
                      </div>
                      <p className="shrink-0 font-bold">{round(item.calories)} kcal</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/signup"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#173c2b] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#1f4d38]"
                >
                  Save this meal and track your day
                  <ArrowRight size={15} weight="bold" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
