const DEFAULT_API_URL = "http://localhost:4000";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  return configured ? trimTrailingSlash(configured) : DEFAULT_API_URL;
}

export function apiUrl(path: string): string {
  return `${getApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getGoogleAuthUrl(): string {
  return apiUrl("/auth/google");
}

export function isLocalApiUrl(url = getApiUrl()): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
}
