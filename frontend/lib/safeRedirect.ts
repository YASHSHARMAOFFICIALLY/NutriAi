export const DEFAULT_AUTH_REDIRECT = "/dashboard";
export const POST_LOGIN_NEXT_KEY = "nutriai.post_login_next";

export function safeNextPath(value: string | null | undefined, fallback = DEFAULT_AUTH_REDIRECT): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://nutriai.local");
    if (url.origin !== "https://nutriai.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function withNextParam(path: string, next: string | null | undefined): string {
  const safeNext = safeNextPath(next);
  if (safeNext === DEFAULT_AUTH_REDIRECT) return path;
  return `${path}${path.includes("?") ? "&" : "?"}next=${encodeURIComponent(safeNext)}`;
}

export function rememberPostLoginNext(next: string | null | undefined): void {
  if (typeof window === "undefined") return;

  const safeNext = safeNextPath(next);
  if (safeNext === DEFAULT_AUTH_REDIRECT) {
    window.localStorage.removeItem(POST_LOGIN_NEXT_KEY);
    return;
  }

  window.localStorage.setItem(POST_LOGIN_NEXT_KEY, safeNext);
}
