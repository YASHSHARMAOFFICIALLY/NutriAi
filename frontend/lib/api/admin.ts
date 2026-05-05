import { apiFetch } from "./client";
import { withQuery } from "./query";
import type {
  AdminActivityResponse,
  AdminAiSettings,
  AdminOverview,
  AdminRuntimeResponse,
  AdminUsageResponse,
  AdminUserDetail,
  AdminUsersResponse,
  UserRole,
} from "./types";

export function getAdminOverview(): Promise<AdminOverview> {
  return apiFetch<AdminOverview>("/admin/overview");
}

export function getAdminRuntime(): Promise<AdminRuntimeResponse> {
  return apiFetch<AdminRuntimeResponse>("/admin/runtime");
}

export function listAdminUsers(params: {
  search?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
} = {}): Promise<AdminUsersResponse> {
  return apiFetch<AdminUsersResponse>(withQuery("/admin/users", params));
}

export function getAdminUserDetail(id: string): Promise<AdminUserDetail> {
  return apiFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`);
}

export function getAdminUsage(params: {
  from?: string;
  to?: string;
} = {}): Promise<AdminUsageResponse> {
  return apiFetch<AdminUsageResponse>(withQuery("/admin/usage", params));
}

export function getAdminActivity(limit = 20): Promise<AdminActivityResponse> {
  return apiFetch<AdminActivityResponse>(withQuery("/admin/activity", { limit }));
}

export function getAdminAiSettings(): Promise<AdminAiSettings> {
  return apiFetch<AdminAiSettings>("/admin/ai-settings");
}

export function updateAdminAiSettings(input: AdminAiSettings): Promise<AdminAiSettings> {
  return apiFetch<AdminAiSettings>("/admin/ai-settings", {
    method: "PUT",
    body: input,
  });
}
