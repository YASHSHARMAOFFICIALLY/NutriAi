"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { AuthCard } from "../_components/AuthCard";
import { resendVerification } from "@/lib/api/emailAuth";

function Inner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    try {
      await resendVerification(email);
      setSent(true);
    } catch {
      setError("Couldn't resend. Try again in a minute.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Check your inbox"
      subtitle={email ? `We sent a verification link to ${email}.` : "We sent you a verification link."}
      footer={
        <>
          Already verified?{" "}
          <Link href="/login" className="font-semibold text-sage-600 hover:underline">Sign in</Link>
        </>
      }
    >
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/70 bg-white/60 px-6 py-7 text-center backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/15">
          <EnvelopeSimple size={22} weight="regular" className="text-sage-600" />
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Tap the link in the email to confirm this address. The link is valid for 24 hours.
        </p>
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={resend}
            disabled={resending || sent || !email}
            className="text-[13px] font-medium text-sage-600 underline underline-offset-2 transition-colors hover:text-forest disabled:opacity-50"
          >
            {sent ? "Sent! Check your inbox again." : resending ? "Resending…" : "Didn't get it? Resend email."}
          </button>
          {error && <p className="text-[11px] text-red-600">{error}</p>}
        </div>
      </div>
    </AuthCard>
  );
}

export default function VerifyPendingPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
