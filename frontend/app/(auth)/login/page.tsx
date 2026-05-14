"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, SealWarning } from "@phosphor-icons/react/dist/ssr";
import { devLogin } from "@/lib/api/account";
import { login } from "@/lib/api/emailAuth";
import { ApiError } from "@/lib/api/client";
import { getGoogleAuthUrl, isLocalApiUrl } from "@/lib/api/config";
import {
  rememberPostLoginNext,
  safeNextPath,
  withNextParam,
} from "@/lib/safeRedirect";

const FEATURES = [
  "Snap a meal - calories back in seconds",
  "AI coach Ria adapts your plan daily",
  "Streaks and insights that actually stick",
] as const;

const MACROS = [
  { label: "Protein", value: "82g", pct: 0.64, color: "bg-sage" },
  { label: "Carbs", value: "140g", pct: 0.82, color: "bg-teal" },
  { label: "Fat", value: "38g", pct: 0.43, color: "bg-white/40" },
] as const;

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

function NutritionCard() {
  return (
    <div
      className="w-64 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl"
      style={{ animation: "float 5s ease-in-out infinite" }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-white">Grain bowl - salmon</p>
          <p className="mt-0.5 text-[11px] text-white/50">Logged in 1.3s</p>
        </div>
        <span className="rounded-full bg-sage/25 px-2 py-0.5 text-[10px] font-semibold text-sage">
          486 kcal
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {MACROS.map((m) => (
          <div key={m.label}>
            <div className="mb-1 flex justify-between text-[10px] text-white/50">
              <span>{m.label}</span>
              <span className="text-white/70">{m.value}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-sage">
        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
        Nutrition scan complete
      </div>
    </div>
  );
}

const ease = [0.22, 1, 0.36, 1] as const;

const leftVariants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = safeNextPath(params.get("next"));
  const signupHref = withNextParam("/signup", nextPath);
  const [devLoading, setDevLoading] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDevLogin = async () => {
    setDevLoading(true);
    setDevError(null);
    try {
      await devLogin("dev@nutriai.test");
      router.replace(nextPath);
    } catch (e) {
      setDevError(e instanceof Error ? e.message : "Dev login failed.");
      setDevLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      router.replace(nextPath);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't sign in. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <motion.div
        variants={leftVariants}
        initial="hidden"
        animate="show"
        className="relative hidden flex-col justify-between overflow-hidden bg-[#0B1E12] p-12 md:flex md:w-[42%]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(127,166,135,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_20%,rgba(94,138,105,0.15),transparent_65%)]" />

        <motion.a variants={itemVariants} href="/" className="relative text-xl font-bold tracking-tight text-white">
          NutriAI
        </motion.a>

        <div className="relative flex flex-col gap-8">
          <motion.h1 variants={itemVariants} className="text-4xl font-bold leading-[1.05] text-white lg:text-5xl">
            Know exactly
            <br />
            <span className="italic text-sage">what you eat.</span>
          </motion.h1>

          <motion.ul variants={itemVariants} className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-[14px] text-white/70">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sage/30 bg-sage/20">
                  <Check size={11} weight="bold" className="text-sage" />
                </span>
                {f}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={itemVariants}>
            <NutritionCard />
          </motion.div>
        </div>

        <motion.p variants={itemVariants} className="relative text-[12px] text-white/30">
          NutriAI - nutrition intelligence for everyone.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease }}
        className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12"
      >
        <div className="w-full max-w-[380px]">
          <Link href="/" className="mb-10 block text-xl font-bold tracking-tight text-forest md:hidden">
            NutriAI
          </Link>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-forest">Get started.</h2>
            <p className="mt-2 text-[15px] leading-[1.5] text-muted">Log your first meal and keep your day on track.</p>
          </div>

          <motion.a
            href={getGoogleAuthUrl(nextPath)}
            onClick={() => rememberPostLoginNext(nextPath)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-5 py-3.5 text-[15px] font-semibold text-foreground shadow-sm transition-shadow hover:shadow-md"
          >
            <GoogleIcon />
            Continue with Google
          </motion.a>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-muted/70">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="Email"
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted/45 focus:border-teal"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted/45 focus:border-teal"
            />

            {error && (
              <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                <SealWarning size={13} weight="fill" className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest py-3 text-[14px] font-semibold text-white shadow-md transition-all hover:bg-forest-soft active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : (<>Sign in <ArrowRight size={13} weight="bold" /></>)}
            </button>

            <div className="flex items-center justify-between text-[12px]">
              <Link href={signupHref} className="text-muted hover:text-teal">Create account</Link>
              <Link href="/forgot-password" className="text-muted hover:text-teal">Forgot password?</Link>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {["Free forever tier", "Cancel anytime", "SOC 2 ready"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[12px] text-muted">
                <Check size={11} weight="bold" className="text-teal" />
                {t}
              </span>
            ))}
          </div>

          {isLocalApiUrl() && (
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <button
                onClick={handleDevLogin}
                disabled={devLoading}
                className="text-[12px] text-muted/70 underline underline-offset-2 transition-colors hover:text-teal disabled:opacity-50"
              >
                {devLoading ? "Signing in..." : "Use dev login (localhost only)"}
              </button>
              {devError && <p className="text-[11px] text-red-600">{devError}</p>}
            </div>
          )}

          <p className="mt-10 text-center text-[11px] leading-[1.6] text-muted/60">
            By continuing you agree to our{" "}
            <a href="#" className="underline hover:text-muted">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-muted">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="h-2 w-48 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 rounded-full bg-forest" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
