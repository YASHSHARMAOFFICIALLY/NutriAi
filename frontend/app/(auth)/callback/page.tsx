"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/api/account";
import { setAccessToken } from "@/lib/api/auth";
import { POST_LOGIN_NEXT_KEY, safeNextPath } from "@/lib/safeRedirect";
import { AuthCard } from "../_components/AuthCard";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = hashParams.get("access_token");
    const storedNext = window.localStorage.getItem(POST_LOGIN_NEXT_KEY);
    const redirectPath = safeNextPath(queryParams.get("next"), safeNextPath(storedNext));
    if (accessToken) {
      setAccessToken(accessToken);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    fetchMe()
      .then(() => {
        if (!cancelled) {
          window.localStorage.removeItem(POST_LOGIN_NEXT_KEY);
          router.push(redirectPath);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <AuthCard title="Finishing sign in" subtitle="Connecting your authenticated session to NutriAI.">
      <div className="space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-black/8">
          <div className={`h-full rounded-full bg-[#173c2b] ${status === "loading" ? "w-2/3" : "w-1/3 bg-[#b7791f]"}`} />
        </div>
        {status === "error" ? <Link href="/login" className="block text-center text-[13px] font-bold text-[#0f8b8d]">Session not found. Back to sign in</Link> : null}
      </div>
    </AuthCard>
  );
}
