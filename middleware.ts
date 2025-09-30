import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/en/login", "/api/auth"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If no session, redirect to login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/en/login", request.url));
  }

  const userType = (session.user as any)?.userType;

  // Admin routes protection
  if (pathname.startsWith("/en/admin")) {
    if (userType !== "admin") {
      return NextResponse.redirect(new URL("/en/login", request.url));
    }
  }

  // Ustaz routes protection
  if (pathname.startsWith("/en/ustaz")) {
    if (userType !== "ustaz") {
      return NextResponse.redirect(new URL("/en/login", request.url));
    }
  }

  // Student routes protection
  if (pathname.startsWith("/en/student")) {
    if (userType !== "student") {
      return NextResponse.redirect(new URL("/en/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
