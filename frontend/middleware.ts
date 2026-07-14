import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE, AUTH_SESSION_MAX_AGE_SECONDS } from "./lib/authSession";
import { safeNextPath } from "./lib/safeRedirect";

const protectedPrefixes = [
  "/admin",
  "/analytics",
  "/challenges",
  "/checkout",
  "/coach",
  // NOTE: /pricing is intentionally NOT protected — unauthenticated users must see prices.
  "/dashboard",
  "/family",
  "/meals",
  "/onboarding",
  "/recommendations",
  "/settings",
  "/snap",
  "/weight",
] as const;

const guestOnlyPaths = ["/login", "/signup"] as const;

function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isGuestOnlyPath(pathname: string): boolean {
  return guestOnlyPaths.some((path) => pathname === path);
}

export function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const hasSession = request.cookies.get(AUTH_SESSION_COOKIE)?.value === "1";

  if (pathname === "/auth/callback" && searchParams.get("session") === "1") {
    const redirectUrl = new URL(safeNextPath(searchParams.get("next")), request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(AUTH_SESSION_COOKIE, "1", {
      httpOnly: false,
      maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  }

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnlyPath(pathname) && hasSession) {
    return NextResponse.redirect(new URL(safeNextPath(searchParams.get("next")), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
