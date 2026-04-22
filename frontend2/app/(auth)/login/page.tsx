"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { devLogin } from "@/lib/api/account";
import { getApiUrl } from "@/lib/api/auth";
import { login } from "@/lib/api/emailAuth";
import { AuthCard } from "../_components/AuthCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleLogin(useDevLogin = false) {
    if (!email.trim()) return;
    setStatus("loading");
    try {
      if (useDevLogin) await devLogin(email.trim());
      else await login({ email: email.trim(), password });
      router.push("/dashboard");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Return to today's meal budget, recommendation ranking, and Coach Ria context."
      footer={<>No account? <Link href="/signup" className="font-bold text-[#0f8b8d]">Create one</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleLogin();
        }}
      >
        <a href={`${getApiUrl()}/auth/google`} className="block w-full rounded-md border border-black/10 bg-[#f8f8f3] py-3 text-center text-[14px] font-bold">Continue with Google</a>
        <button type="button" onClick={() => handleLogin(true)} className="w-full rounded-md border border-black/10 bg-white py-3 text-[14px] font-bold">Dev login with email</button>
        <label className="block">
          <span className="text-[12px] font-semibold text-[#5f675f]">Email</span>
          <input className="mt-2 w-full rounded-md border border-black/10 px-4 py-3 outline-none" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-[#5f675f]">Password</span>
          <input className="mt-2 w-full rounded-md border border-black/10 px-4 py-3 outline-none" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {status === "error" ? <p className="text-[12px] font-semibold text-[#b7791f]">Could not sign in. Check credentials or backend session.</p> : null}
        <button disabled={status === "loading"} className="w-full rounded-md bg-[#173c2b] py-3 text-[14px] font-bold text-white disabled:opacity-60">{status === "loading" ? "Opening..." : "Open workspace"}</button>
        <Link href="/forgot-password" className="block text-center text-[13px] font-bold text-[#0f8b8d]">Forgot password?</Link>
      </form>
    </AuthCard>
  );
}
