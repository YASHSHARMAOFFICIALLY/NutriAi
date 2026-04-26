import { apiFetch } from "./client";
import type { AnalyzeFoodResponse } from "./types";

export interface AnalyzeFoodInput {
  text?: string;
  imageUrl?: string;
  assetId?: string;
}

export function analyzeFood(input: AnalyzeFoodInput): Promise<AnalyzeFoodResponse> {
  return apiFetch<AnalyzeFoodResponse>("/analyze-food", {
    method: "POST",
    body: input,
  });
}
