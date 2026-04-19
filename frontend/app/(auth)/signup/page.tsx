"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Warning } from "@phosphor-icons/react/dist/ssr";
import { AuthCard } from "../_components/AuthCard";
import { register } from "@/lib/api/emailAuth";
import { ApiError } from "@/lib/api/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({ email, password, name: name.trim() || undefined });
      router.replace(`/auth/verify-pending?email=${encodeURIComponent(email)}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't create your account. Try again.");
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start tracking meals in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sage-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Name (optional)">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={80}
            className="input"
            placeholder="Your name"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="input"
            placeholder="••••••••"
          />
        </Field>

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
          {loading ? "Creating account…" : (<>Create account <ArrowRight size={14} weight="bold" /></>)}
        </button>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgba(18, 20, 16, 0.12);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          color: var(--color-ink, #121410);
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #5E8A69;
          box-shadow: 0 0 0 3px rgba(94, 138, 105, 0.15);
        }
        .input::placeholder { color: rgba(18, 20, 16, 0.35); }
      `}</style>
    </AuthCard>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-ink-muted">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ink-muted/70">{hint}</span>}
    </label>
  );
}
