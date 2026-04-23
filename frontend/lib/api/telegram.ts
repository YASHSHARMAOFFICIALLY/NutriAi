import { apiFetch } from "./client";
import type { TelegramLinkResponse, TelegramStatus } from "./types";

export function getTelegramStatus(): Promise<TelegramStatus> {
  return apiFetch<TelegramStatus>("/telegram/status");
}

export function createTelegramLink(): Promise<TelegramLinkResponse> {
  return apiFetch<TelegramLinkResponse>("/telegram/link-token", { method: "POST" });
}

export function unlinkTelegram(): Promise<void> {
  return apiFetch<void>("/telegram/unlink", { method: "DELETE" });
}
