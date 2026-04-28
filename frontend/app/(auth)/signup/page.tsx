"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, SealWarning, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { register } from "@/lib/api/emailAuth";
import { ApiError } from "@/lib/api/client";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function SignupShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-[400px]"
      >
        <Link href="/" className="mb-8 flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-sage/30 bg-sage/15">
            <Sparkle size={14} weight="fill" className="text-sage-600" />
          </span>
          NutriAI
        </Link>
        <h1 className="font-display text-[30px] font-bold tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-[14px] leading-[1.55] text-ink-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 text-center text-[13px] text-ink-muted">{footer}</div>}
      </motion.div>
    </div>
  );
}

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
      router.replace(`/verify-pending?email=${encodeURIComponent(email)}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't create your account. Try again.");
      setLoading(false);
    }
  };

  return (
    <SignupShell
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
            placeholder="Password"
          />
        </Field>

        {error && (
          <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            <SealWarning size={14} weight="fill" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3.5 text-[15px] font-semibold text-cream shadow-[0_2px_8px_rgba(31,59,45,0.25)] transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : (<>Create account <ArrowRight size={14} weight="bold" /></>)}
        </button>
      </form>

      <style>{`
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
          border-color: #5e8a69;
          box-shadow: 0 0 0 3px rgba(94, 138, 105, 0.15);
        }
        .input::placeholder {
          color: rgba(18, 20, 16, 0.35);
        }
      `}</style>
    </SignupShell>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-ink-muted">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ink-muted/70">{hint}</span>}
    </label>
  );
}
