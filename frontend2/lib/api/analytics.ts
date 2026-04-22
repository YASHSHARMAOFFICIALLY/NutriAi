import { apiFetch } from "./client";
import type { DailyAnalytics, MacrosSummary, StreakInfo } from "./types";

export interface DateRangeQuery {
  from?: string;
  to?: string;
}

function qs(q: DateRangeQuery): string {
  const parts: string[] = [];
  if (q.from) parts.push(`from=${encodeURIComponent(q.from)}`);
  if (q.to) parts.push(`to=${encodeURIComponent(q.to)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export function getDailyAnalytics(q: DateRangeQuery = {}): Promise<DailyAnalytics[]> {
  return apiFetch<DailyAnalytics[]>(`/analytics/daily${qs(q)}`);
}

export function getMacrosSummary(q: DateRangeQuery = {}): Promise<MacrosSummary> {
  return apiFetch<MacrosSummary>(`/analytics/macros${qs(q)}`);
}

export function getStreak(): Promise<StreakInfo> {
  return apiFetch<StreakInfo>("/analytics/streak");
}
