export const AUTH_SESSION_COOKIE = "nutriai_auth";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function cookieSecureAttribute(): string {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

export function clearAuthSessionMarker(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${cookieSecureAttribute()}`;
}
