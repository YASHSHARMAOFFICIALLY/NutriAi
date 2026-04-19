"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, EnvelopeSimple, Warning } from "@phosphor-icons/react/dist/ssr";
import { AuthCard } from "../_components/AuthCard";
import { forgotPassword } from "@/lib/api/emailAuth";
import { ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle={`If an account exists for ${email}, we've sent a reset link.`}
        footer={
          <>
            <Link href="/login" className="font-semibold text-sage-600 hover:underline">
              Back to sign in
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/70 bg-white/60 px-6 py-7 text-center backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/15">
            <EnvelopeSimple size={22} weight="regular" className="text-sage-600" />
          </div>
          <p className="text-[13px] leading-relaxed text-ink-muted">
            The reset link is valid for 1 hour. If you don&apos;t see it, check your spam folder.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-sage-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-ink-muted">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-[10px] border border-ink/12 bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-sage-600"
          />
        </label>

        {error && (
          <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            <Warning size={14} weight="fill" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3.5 text-[15px] font-semibold text-cream shadow-[0_2px_8px_rgba(31,59,45,0.25)] transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending…" : (<>Send reset link <ArrowRight size={14} weight="bold" /></>)}
        </button>
      </form>
    </AuthCard>
  );
}
