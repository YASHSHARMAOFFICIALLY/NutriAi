"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApiUrl } from "@/lib/api/auth";
import { register } from "@/lib/api/emailAuth";
import { AuthCard } from "../_components/AuthCard";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit() {
    setStatus("loading");
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.push(`/verify-pending?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Create the account that stores profile inputs, targets, meal history, and private food analysis."
      footer={<>Already have an account? <Link href="/login" className="font-bold text-[#0f8b8d]">Sign in</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <a href={`${getApiUrl()}/auth/google`} className="block w-full rounded-md border border-black/10 bg-[#f8f8f3] py-3 text-center text-[14px] font-bold">Continue with Google</a>
        <input className="w-full rounded-md border border-black/10 px-4 py-3 outline-none" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="w-full rounded-md border border-black/10 px-4 py-3 outline-none" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="w-full rounded-md border border-black/10 px-4 py-3 outline-none" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {status === "error" ? <p className="text-[12px] font-semibold text-[#b7791f]">Could not create account. Check backend config and email settings.</p> : null}
        <button disabled={status === "loading" || !email.trim() || !password} className="w-full rounded-md bg-[#173c2b] py-3 text-[14px] font-bold text-white disabled:opacity-60">{status === "loading" ? "Creating..." : "Create account"}</button>
      </form>
    </AuthCard>
  );
}
