"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { fetchMe } from "@/lib/api/account";
import { getAdminActivity, getAdminAiSettings, getAdminOverview, getAdminRuntime, getAdminUsage, listAdminUsers } from "@/lib/api/admin";
import { getDailySummary, listMeals } from "@/lib/api/meals";
import { getProfile } from "@/lib/api/profile";
import { getMyPlan } from "@/lib/api/payments";
import { getMealRecommendations } from "@/lib/api/recommendations";
import { listMyChallenge, listPresets } from "@/lib/api/challenges";
import { getStreak } from "@/lib/api/analytics";
import { listConversations } from "@/lib/api/chat";
import { getFamilyOverview } from "@/lib/api/family";
import { listWeight } from "@/lib/api/weight";
import { getTelegramStatus } from "@/lib/api/telegram";
import { listApiKeys } from "@/lib/api/apiKeys";
import type { User, UserProfile, DailySummary, MealDTO, MealRecommendationsResponse, UserChallengeDTO, ChallengePreset, ConversationSummary, FamilyOverview, AdminOverview, AdminUsersResponse, AdminUsageResponse, AdminActivityItem, AdminRuntimeResponse, AdminAiSettings, UserRole } from "@/lib/api/types";
import type { UserPlan } from "@/lib/api/payments";
import type { WeightListResponse } from "@/lib/api/weight";

const todayISO = () => new Date().toISOString().slice(0, 10);

// Shared SWR config: dedupe within 10s, revalidate on focus
const defaults: SWRConfiguration = { dedupingInterval: 10_000, revalidateOnFocus: true };

export function useMe(config?: SWRConfiguration) {
  return useSWR<User>("me", () => fetchMe(), { ...defaults, revalidateOnFocus: false, ...config });
}

export function usePlan(config?: SWRConfiguration) {
  return useSWR<UserPlan>("plan", () => getMyPlan({ silent: true }).catch(() => ({ tier: "FREE" as const, status: "ACTIVE" as const, currentPeriodEnd: null, cancelledAt: null })), { ...defaults, ...config });
}

export function useProfile(config?: SWRConfiguration) {
  return useSWR<UserProfile | null>("profile", () => getProfile().catch(() => null), { ...defaults, ...config });
}

export function useDailySummary(date?: string, config?: SWRConfiguration) {
  const d = date ?? todayISO();
  return useSWR<DailySummary>(`daily-summary:${d}`, () => getDailySummary(d), { ...defaults, ...config });
}

export function useMeals(date?: string, config?: SWRConfiguration) {
  const d = date ?? todayISO();
  return useSWR<MealDTO[]>(`meals:${d}`, () => listMeals(d), { ...defaults, ...config });
}

export function useRecommendations(params?: Parameters<typeof getMealRecommendations>[0], config?: SWRConfiguration) {
  const key = params ? `recommendations:${JSON.stringify(params)}` : "recommendations";
  return useSWR<MealRecommendationsResponse>(key, () => getMealRecommendations(params), { ...defaults, ...config });
}

export function useActiveChallenges(config?: SWRConfiguration) {
  return useSWR<UserChallengeDTO[]>("challenges:active", () => listMyChallenge("ACTIVE").catch(() => []), { ...defaults, ...config });
}

export function useAllChallenges(config?: SWRConfiguration) {
  return useSWR<UserChallengeDTO[]>("challenges:all", () => listMyChallenge().catch(() => []), { ...defaults, ...config });
}

export function useChallengePresets(config?: SWRConfiguration) {
  return useSWR<ChallengePreset[]>("challenge-presets", () => listPresets(), { ...defaults, ...config });
}

export function useStreak(config?: SWRConfiguration) {
  return useSWR<{ loggingStreak: number } | null>("streak", () => getStreak().catch(() => null), { ...defaults, ...config });
}

export function useConversations(config?: SWRConfiguration) {
  return useSWR<ConversationSummary[]>("conversations", () => listConversations().catch(() => []), { ...defaults, ...config });
}

export function useFamilyOverview(config?: SWRConfiguration) {
  return useSWR<FamilyOverview>("family-overview", () => getFamilyOverview(), { ...defaults, ...config });
}

export function useWeight(limit = 90, config?: SWRConfiguration) {
  return useSWR<WeightListResponse>(`weight:${limit}`, () => listWeight({ limit }), { ...defaults, ...config });
}

export function useTelegramStatus(config?: SWRConfiguration) {
  return useSWR("telegram-status", () => getTelegramStatus().catch(() => null), { ...defaults, ...config });
}

export function useApiKeys(config?: SWRConfiguration) {
  return useSWR("api-keys", () => listApiKeys().catch(() => []), { ...defaults, ...config });
}

// --- Admin hooks ---

export function useAdminOverview(enabled: boolean, config?: SWRConfiguration) {
  return useSWR<AdminOverview>(enabled ? "admin-overview" : null, () => getAdminOverview(), { ...defaults, ...config });
}

export function useAdminUsers(enabled: boolean, params: { search?: string; role?: UserRole; page?: number; limit?: number } = {}, config?: SWRConfiguration) {
  const key = enabled ? `admin-users:${JSON.stringify(params)}` : null;
  return useSWR<AdminUsersResponse>(key, () => listAdminUsers(params), { ...defaults, ...config });
}

export function useAdminUsage(enabled: boolean, params: { from?: string; to?: string } = {}, config?: SWRConfiguration) {
  const key = enabled ? `admin-usage:${JSON.stringify(params)}` : null;
  return useSWR<AdminUsageResponse>(key, () => getAdminUsage(params), { ...defaults, ...config });
}

export function useAdminActivity(enabled: boolean, limit = 10, config?: SWRConfiguration) {
  return useSWR<AdminActivityItem[]>(enabled ? `admin-activity:${limit}` : null, () => getAdminActivity(limit).then((r) => r.items), { ...defaults, ...config });
}

export function useAdminRuntime(enabled: boolean, config?: SWRConfiguration) {
  return useSWR<AdminRuntimeResponse>(enabled ? "admin-runtime" : null, () => getAdminRuntime(), { ...defaults, ...config });
}

export function useAdminAiSettings(enabled: boolean, config?: SWRConfiguration) {
  return useSWR<AdminAiSettings>(enabled ? "admin-ai-settings" : null, () => getAdminAiSettings(), { ...defaults, ...config });
}
