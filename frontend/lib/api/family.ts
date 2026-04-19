import { apiFetch } from "./client";
import type { DailySummary, MealDTO, StreakInfo } from "./types";

export interface FamilyUserMini {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface FamilyShare {
  shareId: string;
  owner: FamilyUserMini;
  acceptedAt: string | null;
}

export interface FamilyPendingShare {
  shareId: string;
  owner: FamilyUserMini;
  createdAt: string;
}

export interface FamilyOutgoingShare {
  shareId: string;
  viewer: FamilyUserMini;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  invitedEmail: string;
  createdAt: string;
  acceptedAt: string | null;
}

export function inviteFamily(email: string) {
  return apiFetch<{ share: unknown }>("/shares/invite", {
    method: "POST",
    body: { email },
  });
}

export function acceptFamilyInvite(shareId: string) {
  return apiFetch<{ share: unknown }>(`/shares/${shareId}/accept`, { method: "POST" });
}

export function revokeFamilyShare(shareId: string) {
  return apiFetch<{ share: unknown }>(`/shares/${shareId}`, { method: "DELETE" });
}

export function listViewable() {
  return apiFetch<{ shares: FamilyShare[] }>("/shares/viewable").then((r) => r.shares);
}

export function listPendingInvites() {
  return apiFetch<{ shares: FamilyPendingShare[] }>("/shares/pending").then((r) => r.shares);
}

export function listOutgoingShares() {
  return apiFetch<{ shares: FamilyOutgoingShare[] }>("/shares/outgoing").then((r) => r.shares);
}

export function getSharedMeals(ownerId: string, date: string) {
  const q = `?date=${encodeURIComponent(date)}`;
  return apiFetch<{ date: string; meals: MealDTO[] }>(`/shares/${ownerId}/meals${q}`);
}

export function getSharedDailySummary(ownerId: string, date: string) {
  const q = `?date=${encodeURIComponent(date)}`;
  return apiFetch<DailySummary>(`/shares/${ownerId}/daily-summary${q}`);
}

export function getSharedStreak(ownerId: string) {
  return apiFetch<StreakInfo & { today: string; loggingStreak: number }>(
    `/shares/${ownerId}/streak`,
  );
}
