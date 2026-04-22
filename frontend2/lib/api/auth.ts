const STORAGE_KEY = "nutriai.access_token";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
  clearLegacyStoredToken();
}

export function clearAccessToken(): void {
  accessToken = null;
  clearLegacyStoredToken();
}

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function clearLegacyStoredToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
