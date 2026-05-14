import { AUTH_SESSION_COOKIE, AUTH_SESSION_MAX_AGE_SECONDS } from "../authSession";

const STORAGE_KEY = "nutriai.access_token";
export { AUTH_SESSION_COOKIE } from "../authSession";
export { getApiUrl } from "./config";

export function clearAccessToken(): void {
  clearAuthSessionMarker();
  clearLegacyStoredToken();
}

function clearLegacyStoredToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function cookieSecureAttribute(): string {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

export function setAuthSessionMarker(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=1; Path=/; Max-Age=${AUTH_SESSION_MAX_AGE_SECONDS}; SameSite=Lax${cookieSecureAttribute()}`;
}

function clearAuthSessionMarker(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${cookieSecureAttribute()}`;
}
