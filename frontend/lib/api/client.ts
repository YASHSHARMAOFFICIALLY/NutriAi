import { clearAccessToken, getAccessToken, setAccessToken } from "./auth";
import { apiUrl } from "./config";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken?: string };
      if (!data.accessToken) return false;
      setAccessToken(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      // Allow another refresh later if needed
      setTimeout(() => { refreshPromise = null; }, 0);
    }
  })();
  return refreshPromise;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  window.location.href = "/login";
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  retry?: boolean;
  /** When true, don't redirect to /login on 401; just throw. */
  silent?: boolean;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, retry = true, silent = false, headers, ...rest } = options;
  const token = getAccessToken();

  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  };
  if (body !== undefined) init.body = JSON.stringify(body);

  const res = await fetch(apiUrl(path), init);

  if (res.status === 401 && retry) {
    const ok = await tryRefresh();
    if (ok) {
      return apiFetch<T>(path, { ...options, retry: false });
    }
    clearAccessToken();
    if (!silent) redirectToLogin();
    throw new UnauthorizedError();
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const errBody = (data as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiError(
      errBody?.message ?? `Request failed: ${res.status}`,
      res.status,
      errBody?.code ?? "UNKNOWN",
      errBody?.details
    );
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
