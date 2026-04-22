import { apiFetch } from "./client";
import { clearAccessToken, getApiUrl, setAccessToken } from "./auth";
import type { User } from "./types";

export async function fetchMe(): Promise<User> {
  const res = await apiFetch<{ user: User }>("/auth/me", { silent: true, retry: true });
  return res.user;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST", silent: true });
  } finally {
    clearAccessToken();
  }
}

/** Dev-only: exchange an email for tokens. Backend only allows this outside production. */
export async function devLogin(email: string): Promise<User> {
  const res = await fetch(`${getApiUrl()}/auth/dev-login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(`Dev login failed (${res.status})`);
  }
  const data = (await res.json()) as { accessToken: string; user: User };
  setAccessToken(data.accessToken);
  return data.user;
}
