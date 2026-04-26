import { apiFetch } from "./client";

export interface WeightEntry {
  id: string;
  weightKg: number;
  note: string | null;
  recordedAt: string;
  createdAt: string;
}

export interface WeightListResponse {
  entries: WeightEntry[];
  latest: WeightEntry | null;
  first: WeightEntry | null;
  deltaKg: number;
}

export function createWeight(input: {
  weightKg: number;
  recordedAt?: string;
  note?: string | null;
}): Promise<WeightEntry> {
  return apiFetch<{ entry: WeightEntry }>("/weight", {
    method: "POST",
    body: input,
  }).then((r) => r.entry);
}

export function listWeight(params: { from?: string; to?: string; limit?: number } = {}) {
  const q = new URLSearchParams();
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.limit) q.set("limit", String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return apiFetch<WeightListResponse>(`/weight${suffix}`);
}

export function deleteWeight(id: string): Promise<void> {
  return apiFetch<void>(`/weight/${id}`, { method: "DELETE" });
}

export const kgToLb = (kg: number) => kg * 2.20462;
export const lbToKg = (lb: number) => lb / 2.20462;
