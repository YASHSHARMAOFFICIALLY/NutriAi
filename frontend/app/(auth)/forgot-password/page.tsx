"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/api/emailAuth";
import { AuthCard } from "../_components/AuthCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit() {
    setStatus("loading");
    try {
      await forgotPassword(email.trim());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AuthCard title="Reset password" subtitle="Enter your email and NutriAI will send a reset link.">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <input className="w-full rounded-md border border-black/10 px-4 py-3 outline-none" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        {status === "sent" ? <p className="text-[12px] font-semibold text-[#173c2b]">Reset email sent if this account exists.</p> : null}
        {status === "error" ? <p className="text-[12px] font-semibold text-[var(--danger)]">Could not request reset link.</p> : null}
        <button disabled={status === "loading" || !email.trim()} className="w-full rounded-md bg-[#173c2b] py-3 text-[14px] font-bold text-white disabled:opacity-60">{status === "loading" ? "Sending..." : "Send reset link"}</button>
        <Link href="/login" className="block text-center text-[13px] font-bold text-[#0f8b8d]">Back to sign in</Link>
      </form>
    </AuthCard>
  );
}
