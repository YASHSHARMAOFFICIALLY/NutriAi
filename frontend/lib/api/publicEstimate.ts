import { apiFetch } from "./client";
import type { AnalyzeFoodResponse } from "./types";

export interface PublicEstimateInput {
  text?: string;
  imageUrl?: string;
}

export type PublicEstimateResponse = Omit<AnalyzeFoodResponse, "queryId">;

export async function estimateMealPublic(input: PublicEstimateInput): Promise<PublicEstimateResponse> {
  return apiFetch<PublicEstimateResponse>("/public/estimate", {
    method: "POST",
    body: input,
    retry: false,
    silent: true,
  });
}
