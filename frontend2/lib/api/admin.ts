import { apiFetch } from "./client";
import type {
  AdminActivityResponse,
  AdminOverview,
  AdminRuntimeResponse,
  AdminUsageResponse,
  AdminUsersResponse,
  UserRole,
} from "./types";

function query(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") sp.set(key, String(value));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

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
  return apiFetch<AdminUsersResponse>(`/admin/users${query(params)}`);
}

export function getAdminUsage(params: {
  from?: string;
  to?: string;
} = {}): Promise<AdminUsageResponse> {
  return apiFetch<AdminUsageResponse>(`/admin/usage${query(params)}`);
}

export function getAdminActivity(limit = 20): Promise<AdminActivityResponse> {
  return apiFetch<AdminActivityResponse>(`/admin/activity${query({ limit })}`);
}
