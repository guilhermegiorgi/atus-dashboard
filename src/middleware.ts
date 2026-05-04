import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "atus-session";

const publicPaths = ["/login"];
const authApiPaths = ["/api/v1/auth/"];

function isPublicPath(pathname: string): boolean {
  if (publicPaths.some((p) => pathname === p)) return true;
  if (authApiPaths.some((p) => pathname.startsWith(p))) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
