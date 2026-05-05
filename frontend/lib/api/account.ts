import { apiFetch } from "./client";
import { clearAccessToken, setAccessToken } from "./auth";
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
  const data = await apiFetch<{ accessToken: string; user: User }>("/auth/dev-login", {
    method: "POST",
    body: { email },
    silent: true,
    retry: false,
  });
  setAccessToken(data.accessToken);
  return data.user;
}
