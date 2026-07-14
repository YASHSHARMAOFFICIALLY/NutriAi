"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyEmail } from "@/lib/api/emailAuth";
import { POST_LOGIN_NEXT_KEY, safeNextPath, withNextParam } from "@/lib/safeRedirect";
import { AuthCard } from "@/app/(auth)/_components/AuthCard";

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const nextParam = params.get("next");
  const loginHref = withNextParam("/login", nextParam);
  const [status, setStatus] = useState<"loading" | "verified" | "error">(token ? "loading" : "error");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (cancelled) return;
        const storedNext = window.localStorage.getItem(POST_LOGIN_NEXT_KEY);
        const redirectPath = safeNextPath(nextParam, safeNextPath(storedNext));
        window.localStorage.removeItem(POST_LOGIN_NEXT_KEY);
        setStatus("verified");
        router.push(redirectPath);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [nextParam, router, token]);

  return (
    <AuthCard title="Verify your email" subtitle="Email verification protects meal, weight, and profile data.">
      <div className="space-y-4">
        <div className="rounded-md bg-[#eef5f2] p-4 text-[14px] leading-6 text-[#5f675f]">
          {status === "loading" ? "Verifying your email..." : status === "verified" ? "Email verified. Redirecting..." : "Verification link is missing or expired."}
        </div>
        <Link href={loginHref} className="block rounded-md bg-[#173c2b] py-3 text-center text-[14px] font-bold text-white">Back to sign in</Link>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthCard title="Verify your email" subtitle="Preparing verification."><div className="h-2 rounded-full bg-black/8" /></AuthCard>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
