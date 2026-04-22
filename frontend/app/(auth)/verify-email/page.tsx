"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Warning, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { AuthCard } from "../_components/AuthCard";
import { verifyEmail } from "@/lib/api/emailAuth";
import { ApiError } from "@/lib/api/client";

type State = "loading" | "ok" | "error";

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [state, setState] = useState<State>(token ? "loading" : "error");
  const [error, setError] = useState<string | null>(token ? null : "Missing verification token.");

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (cancelled) return;
        setState("ok");
        setTimeout(() => router.replace("/dashboard"), 1200);
      })
      .catch((e) => {
        if (cancelled) return;
        setState("error");
        setError(e instanceof ApiError ? e.message : "Couldn't verify this link.");
      });
    return () => { cancelled = true; };
  }, [token, router]);

  if (state === "loading") {
    return (
      <AuthCard title="Verifying…" subtitle="One second while we confirm your email.">
        <div className="flex justify-center py-6">
          <Sparkle size={32} weight="fill" className="animate-pulse text-sage-600" />
        </div>
      </AuthCard>
    );
  }

  if (state === "ok") {
    return (
      <AuthCard title="You're in." subtitle="Taking you to the dashboard…">
        <div className="flex justify-center py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
            <CheckCircle size={30} weight="fill" className="text-forest" />
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Link didn't work"
      subtitle={error ?? "This link may have expired or already been used."}
      footer={
        <>
          Need a new link?{" "}
          <Link href="/login" className="font-semibold text-sage-600 hover:underline">
            Go back to sign in
          </Link>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
        <Warning size={16} weight="fill" className="mt-0.5 shrink-0" />
        <span>Try requesting a new verification email from the sign-in page.</span>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
