"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getMyPlan, type UserPlan } from "@/lib/api/payments";

export default function CheckoutSuccessPage() {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    // Poll for plan update — webhook may take a moment
    const check = async () => {
      try {
        const p = await getMyPlan();
        setPlan(p);
        if (p.tier === "PRO") return;
      } catch {}
      if (retries < 10) {
        setTimeout(() => setRetries((r) => r + 1), 2000);
      }
    };
    check();
  }, [retries]);

  const isPro = plan?.tier === "PRO";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#d7ff68]/20">
          <CheckCircle
            size={48}
            weight="fill"
            className={isPro ? "text-[#0f8b8d]" : "text-[#5f675f] animate-pulse"}
          />
        </div>

        <h1 className="text-[32px] font-bold tracking-tight text-forest">
          {isPro ? "Welcome to Pro!" : "Processing payment..."}
        </h1>

        <p className="mt-3 text-[15px] leading-7 text-[#5f675f]">
          {isPro
            ? "Your account has been upgraded. All Pro features are now unlocked."
            : "Your payment is being confirmed. This usually takes just a few seconds."}
        </p>

        {isPro ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 text-[14px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Go to Dashboard
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/coach"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 py-3 text-[14px] font-bold text-forest transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Try Coach Cuckoo
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-black/10">
              <div className="h-full w-1/3 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-[#0f8b8d]" />
            </div>
            <p className="mt-4 text-[13px] text-[#5f675f]">
              If this takes more than a minute, check your email for confirmation or{" "}
              <Link href="/settings" className="font-semibold text-[#0f8b8d] underline">
                visit settings
              </Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
