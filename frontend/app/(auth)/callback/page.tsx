"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { setAccessToken } from "@/lib/api/auth";

function parseHash(hash: string): Record<string, string> {
  const out: Record<string, string> = {};
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!clean) return out;
  for (const pair of clean.split("&")) {
    const [k, v] = pair.split("=");
    if (k && v) out[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return out;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = parseHash(window.location.hash);
    const token = params.access_token;

    if (!token) {
      const errorTimer = setTimeout(() => {
        setError("No access token returned. Please try signing in again.");
      }, 0);
      const redirectTimer = setTimeout(() => router.replace("/login"), 1500);
      return () => {
        clearTimeout(errorTimer);
        clearTimeout(redirectTimer);
      };
    }

    setAccessToken(token);
    // Strip the hash so a refresh doesn't leak the token.
    window.history.replaceState(null, "", window.location.pathname);
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sage/30 bg-sage/15">
          <Sparkle size={18} weight="fill" className="text-sage-600" />
        </div>
        {error ? (
          <>
            <h1 className="font-display text-[22px] font-bold text-ink">Sign in failed</h1>
            <p className="max-w-sm text-[14px] text-ink-muted">{error}</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-[22px] font-bold text-ink">Signing you in…</h1>
            <p className="text-[13px] text-ink-muted">One second while we get things ready.</p>
          </>
        )}
      </div>
    </div>
  );
}
