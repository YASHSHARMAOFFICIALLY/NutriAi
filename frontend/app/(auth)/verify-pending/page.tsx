"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { resendVerification } from "@/lib/api/emailAuth";
import { AuthCard } from "../_components/AuthCard";

function VerifyPendingContent() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleResend() {
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await resendVerification(email.trim());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AuthCard title="Check your inbox" subtitle="We sent a verification link before you can use the app workspace.">
      <div className="space-y-4">
        <input className="w-full rounded-md border border-black/10 px-4 py-3 outline-none" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        {status === "sent" ? <p className="text-[12px] font-semibold text-[#173c2b]">Verification email sent.</p> : null}
        {status === "error" ? <p className="text-[12px] font-semibold text-[#b7791f]">Could not resend verification email.</p> : null}
        <button onClick={handleResend} disabled={status === "loading" || !email.trim()} className="w-full rounded-md border border-black/10 bg-[#f8f8f3] py-3 text-[14px] font-bold disabled:opacity-60">{status === "loading" ? "Sending..." : "Resend email"}</button>
      </div>
    </AuthCard>
  );
}

export default function VerifyPendingPage() {
  return (
    <Suspense fallback={<AuthCard title="Check your inbox" subtitle="Preparing verification controls."><div className="h-2 rounded-full bg-black/8" /></AuthCard>}>
      <VerifyPendingContent />
    </Suspense>
  );
}
