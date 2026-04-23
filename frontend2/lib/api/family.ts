import { apiFetch } from "./client";
import type {
  DailyAnalytics,
  FamilyInviteResponse,
  FamilyMemberDTO,
  FamilyOverview,
  MacrosSummary,
  StreakInfo,
} from "./types";
import type { DateRangeQuery } from "./analytics";

function qs(q: DateRangeQuery): string {
  const parts: string[] = [];
  if (q.from) parts.push(`from=${encodeURIComponent(q.from)}`);
  if (q.to) parts.push(`to=${encodeURIComponent(q.to)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export function getFamilyOverview(): Promise<FamilyOverview> {
  return apiFetch<FamilyOverview>("/family");
}

export function createFamilyInvite(email: string): Promise<FamilyInviteResponse> {
  return apiFetch<FamilyInviteResponse>("/family/invites", {
    method: "POST",
    body: { email },
  });
}

export function acceptFamilyInvite(token: string): Promise<FamilyMemberDTO> {
  return apiFetch<FamilyMemberDTO>(`/family/invites/${encodeURIComponent(token)}/accept`, {
    method: "POST",
  });
}

export function revokeFamilyInvite(inviteId: string): Promise<void> {
  return apiFetch<void>(`/family/invites/${inviteId}`, { method: "DELETE" });
}

export function removeFamilyMember(memberId: string): Promise<void> {
  return apiFetch<void>(`/family/members/${memberId}`, { method: "DELETE" });
}

export function getFamilyDailyAnalytics(memberId: string, q: DateRangeQuery = {}): Promise<DailyAnalytics> {
  return apiFetch<DailyAnalytics>(`/family/members/${memberId}/analytics/daily${qs(q)}`);
}

export function getFamilyMacrosSummary(memberId: string, q: DateRangeQuery = {}): Promise<MacrosSummary> {
  return apiFetch<MacrosSummary>(`/family/members/${memberId}/analytics/macros${qs(q)}`);
}

export function getFamilyStreak(memberId: string): Promise<StreakInfo> {
  return apiFetch<StreakInfo>(`/family/members/${memberId}/analytics/streak`);
}
