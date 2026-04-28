"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, SealWarning, Sparkle, Check } from "@phosphor-icons/react/dist/ssr";
import { register } from "@/lib/api/emailAuth";
import { ApiError } from "@/lib/api/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84-.08-.69z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

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
      <a
        href={`${API_URL}/auth/google`}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/12 bg-white px-5 py-3.5 text-[15px] font-semibold text-[#121410] shadow-[0_2px_8px_rgba(31,59,45,0.07)] transition-shadow hover:shadow-[0_4px_16px_rgba(31,59,45,0.12)]"
      >
        <GoogleIcon />
        Continue with Google
      </a>

      <div className="my-2 flex items-center gap-4">
        <div className="h-px flex-1 bg-black/8" />
        <span className="text-[11px] uppercase tracking-[0.15em] text-black/30">or</span>
        <div className="h-px flex-1 bg-black/8" />
      </div>

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
