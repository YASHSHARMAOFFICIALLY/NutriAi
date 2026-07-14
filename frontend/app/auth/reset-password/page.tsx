"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { resetPassword } from "@/lib/api/emailAuth";
import { AuthCard } from "@/app/(auth)/_components/AuthCard";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit() {
    if (!token || password !== confirm) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await resetPassword({ token, password });
      router.push("/dashboard");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Use a fresh password for this NutriAI account.">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <input className="w-full rounded-md border border-black/10 px-4 py-3 outline-none" placeholder="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <input className="w-full rounded-md border border-black/10 px-4 py-3 outline-none" placeholder="Confirm password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        {status === "error" ? <p className="text-[12px] font-semibold text-[var(--danger)]">Reset link is missing/expired or passwords do not match.</p> : null}
        <button disabled={status === "loading" || !password || !confirm} className="w-full rounded-md bg-[#173c2b] py-3 text-[14px] font-bold text-white disabled:opacity-60">{status === "loading" ? "Updating..." : "Update password"}</button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCard title="Choose a new password" subtitle="Preparing reset form."><div className="h-2 rounded-full bg-black/8" /></AuthCard>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
