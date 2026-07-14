import { apiFetch } from "./client";
import { withQuery } from "./query";

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
  return apiFetch<WeightListResponse>(withQuery("/weight", params));
}

export function deleteWeight(id: string): Promise<void> {
  return apiFetch<void>(`/weight/${id}`, { method: "DELETE" });
}
