import { apiFetch } from "./client";
import { withQuery } from "./query";
import type { DailyAnalytics, MacrosSummary, StreakInfo } from "./types";

export interface DateRangeQuery {
  from?: string;
  to?: string;
}

export function getDailyAnalytics(q: DateRangeQuery = {}): Promise<DailyAnalytics> {
  return apiFetch<DailyAnalytics>(withQuery("/analytics/daily", q));
}

export function getMacrosSummary(q: DateRangeQuery = {}): Promise<MacrosSummary> {
  return apiFetch<MacrosSummary>(withQuery("/analytics/macros", q));
}

export function getStreak(): Promise<StreakInfo> {
  return apiFetch<StreakInfo>("/analytics/streak");
}
