import { apiFetch } from "./client";
import { withQuery } from "./query";
import type { HistoryEntry, PaginatedResponse } from "./types";

export function listHistory(params: {
  from?: string;
  to?: string;
  minCalories?: number;
  maxCalories?: number;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedResponse<HistoryEntry>> {
  return apiFetch<PaginatedResponse<HistoryEntry>>(withQuery("/history", params));
}
