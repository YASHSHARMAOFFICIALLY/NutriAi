"use client";

import { Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ForkKnife, SealWarning } from "@phosphor-icons/react/dist/ssr";
import { register } from "@/lib/api/emailAuth";
import { ApiError } from "@/lib/api/client";
import { getGoogleAuthUrl } from "@/lib/api/config";
import { rememberPostLoginNext, safeNextPath, withNextParam } from "@/lib/safeRedirect";
import { GoogleIcon } from "../_components/GoogleIcon";

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
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-[400px]"
      >
        <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold tracking-tight text-forest">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest text-white">
            <ForkKnife size={15} weight="bold" />
          </span>
          NutriAI
        </Link>
        <h1 className="text-[30px] font-bold text-forest">{title}</h1>
        {subtitle && <p className="mt-2 text-[14px] leading-[1.55] text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 text-center text-[13px] text-muted">{footer}</div>}
      </motion.div>
    </div>
  );
}

function SignupContent() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = safeNextPath(params.get("next"));
  const loginHref = withNextParam("/login", nextPath);
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
      rememberPostLoginNext(nextPath);
      router.replace(withNextParam(`/verify-pending?email=${encodeURIComponent(email)}`, nextPath));
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
          <Link href={loginHref} className="font-semibold text-teal hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <a
        href={getGoogleAuthUrl(nextPath)}
        onClick={() => rememberPostLoginNext(nextPath)}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-5 py-3.5 text-[15px] font-semibold text-foreground shadow-sm transition-shadow hover:shadow-md"
      >
        <GoogleIcon />
        Continue with Google
      </a>

      <div className="my-2 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-[0.15em] text-muted/70">or</span>
        <div className="h-px flex-1 bg-border" />
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
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-forest py-3.5 text-[15px] font-semibold text-white shadow-md transition-[background-color,transform] hover:bg-forest-soft active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : (<>Create account <ArrowRight size={14} weight="bold" /></>)}
        </button>
      </form>

      <p className="mt-3 text-center text-[11px] leading-[1.6] text-muted/60">
        By continuing you agree to the{" "}
        <Link href="/terms" className="underline hover:text-muted">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline hover:text-muted">Privacy Policy</Link>.
      </p>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgba(18, 20, 16, 0.12);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          color: var(--foreground);
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(15, 139, 141, 0.14);
        }
        .input::placeholder {
          color: rgba(18, 20, 16, 0.35);
        }
      `}</style>
    </SignupShell>
  );
}

function SignupFallback() {
  return (
    <SignupShell title="Create your account" subtitle="Preparing sign up.">
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 rounded-full bg-forest" />
      </div>
    </SignupShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupContent />
    </Suspense>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted/70">{hint}</span>}
    </label>
  );
}
