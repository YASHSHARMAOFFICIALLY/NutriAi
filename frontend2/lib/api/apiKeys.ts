import { apiFetch } from "./client";
import type { ApiKeyRow, IssuedApiKey } from "./types";

export function listApiKeys(): Promise<ApiKeyRow[]> {
  return apiFetch<{ keys: ApiKeyRow[] }>("/api-keys").then((res) => res.keys);
}

export function createApiKey(input: {
  name: string;
  scopes?: string[];
  rateLimitPerMin?: number;
}): Promise<IssuedApiKey> {
  return apiFetch<IssuedApiKey>("/api-keys", {
    method: "POST",
    body: input,
  });
}

export function revokeApiKey(id: string): Promise<Pick<ApiKeyRow, "id" | "name" | "prefix" | "revokedAt">> {
  return apiFetch<Pick<ApiKeyRow, "id" | "name" | "prefix" | "revokedAt">>(`/api-keys/${id}`, {
    method: "DELETE",
  });
}
