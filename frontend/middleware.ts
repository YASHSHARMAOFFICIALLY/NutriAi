import { NextResponse, type NextRequest } from "next/server";

const AUTH_SESSION_COOKIE = "nutriai_auth";

const protectedPrefixes = [
  "/admin",
  "/analytics",
  "/challenges",
  "/checkout",
  "/coach",
  "/dashboard",
  "/family",
  "/meals",
  "/onboarding",
  "/pricing",
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
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.get(AUTH_SESSION_COOKIE)?.value === "1";

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnlyPath(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
