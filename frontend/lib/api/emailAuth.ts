import { apiFetch } from "./client";
import { setAuthSessionMarker } from "./auth";
import type { User } from "./types";

interface AuthResponse {
  user: Pick<User, "id" | "email" | "role"> & { name?: string | null };
}

export async function register(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ verificationRequired: boolean }> {
  const res = await apiFetch<{ ok: true; verificationRequired: boolean }>(
    "/auth/register",
    { method: "POST", body: input, silent: true, retry: false },
  );
  return { verificationRequired: res.verificationRequired };
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse["user"]> {
  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: input,
    silent: true,
    retry: false,
  });
  setAuthSessionMarker();
  return res.user;
}

export async function verifyEmail(token: string): Promise<AuthResponse["user"]> {
  const res = await apiFetch<AuthResponse>("/auth/verify-email", {
    method: "POST",
    body: { token },
    silent: true,
    retry: false,
  });
  setAuthSessionMarker();
  return res.user;
}

export async function resendVerification(email: string): Promise<void> {
  await apiFetch<{ ok: true }>("/auth/resend-verification", {
    method: "POST",
    body: { email },
    silent: true,
    retry: false,
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch<{ ok: true }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    silent: true,
    retry: false,
  });
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<AuthResponse["user"]> {
  const res = await apiFetch<AuthResponse>("/auth/reset-password", {
    method: "POST",
    body: input,
    silent: true,
    retry: false,
  });
  setAuthSessionMarker();
  return res.user;
}
