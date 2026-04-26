import { apiFetch } from "./client";
import type { HistoryEntry, PaginatedResponse } from "./types";

export function listHistory(params: {
  from?: string;
  to?: string;
  minCalories?: number;
  maxCalories?: number;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedResponse<HistoryEntry>> {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.minCalories != null) query.set("minCalories", String(params.minCalories));
  if (params.maxCalories != null) query.set("maxCalories", String(params.maxCalories));
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<PaginatedResponse<HistoryEntry>>(`/history${suffix}`);
}
