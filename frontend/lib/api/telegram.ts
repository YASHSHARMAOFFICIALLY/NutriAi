import { apiFetch } from "./client";

export interface TelegramStatus {
  linked: boolean;
  botUsername: string | null;
  account: {
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    linkedAt: string;
    lastSeenAt: string | null;
  } | null;
}

export interface TelegramLink {
  token: string;
  expiresAt: string;
  botUsername: string | null;
  deepLink: string | null;
}

export function getTelegramStatus(): Promise<TelegramStatus> {
  return apiFetch<TelegramStatus>("/telegram/status");
}

export function createTelegramLink(): Promise<TelegramLink> {
  return apiFetch<TelegramLink>("/telegram/link-token", { method: "POST" });
}

export function unlinkTelegram(): Promise<void> {
  return apiFetch<void>("/telegram/unlink", { method: "DELETE" });
}
