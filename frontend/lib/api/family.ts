import { apiFetch } from "./client";
import { withQuery } from "./query";
import type {
  DailyAnalytics,
  FamilyInviteResponse,
  FamilyMemberDTO,
  FamilyOverview,
  MacrosSummary,
  StreakInfo,
} from "./types";
import type { DateRangeQuery } from "./analytics";

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
  return apiFetch<DailyAnalytics>(withQuery(`/family/members/${memberId}/analytics/daily`, q));
}

export function getFamilyMacrosSummary(memberId: string, q: DateRangeQuery = {}): Promise<MacrosSummary> {
  return apiFetch<MacrosSummary>(withQuery(`/family/members/${memberId}/analytics/macros`, q));
}

export function getFamilyStreak(memberId: string): Promise<StreakInfo> {
  return apiFetch<StreakInfo>(`/family/members/${memberId}/analytics/streak`);
}
