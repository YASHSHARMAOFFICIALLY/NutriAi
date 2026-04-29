import { getApiUrl } from "./auth";
import type { AnalyzeFoodResponse } from "./types";

export interface PublicEstimateInput {
  text?: string;
  imageUrl?: string;
}

export type PublicEstimateResponse = Omit<AnalyzeFoodResponse, "queryId">;

export async function estimateMealPublic(input: PublicEstimateInput): Promise<PublicEstimateResponse> {
  const res = await fetch(`${getApiUrl()}/public/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } } | null)?.error?.message ??
      "Could not estimate this meal right now.";
    throw new Error(message);
  }

  return data as PublicEstimateResponse;
}
