// import { auth } from "@/auth";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export default async function middleware(request: NextRequest) {
//   const session = await auth();
//   const { pathname } = request.nextUrl;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const userType = (session?.user as any)?.userType;

//   // Public routes that don't require authentication
//   const publicRoutes = ["/en/login", "/en/student",];
//   const isPublicRoute = publicRoutes.some(
//     (route) => pathname === route || pathname.startsWith(route + "/")
//   );

//   // Skip middleware for dashboard routes (they handle their own redirects)
//   if (pathname.includes("/(dashboard)") || pathname.endsWith("/dashboard")) {
//     return NextResponse.next();
//   }

//   // If not authenticated and trying to access protected route
//   if (!session && !isPublicRoute && !pathname.startsWith("/en/login")) {
//     return NextResponse.redirect(new URL("/en/login", request.url));
//   }

//   // If authenticated, handle role-based access
//   if (session && userType) {
//     // Admin trying to access non-admin routes
//     if (userType === "admin" && pathname.startsWith("/en/ustaz")) {
//       return NextResponse.redirect(new URL("/en/admin", request.url));
//     }

//     // Ustaz trying to access admin routes
//     if (userType === "ustaz" && pathname.startsWith("/en/admin")) {
//       return NextResponse.redirect(new URL("/en/ustaz", request.url));
//     }

//     // Redirect to appropriate dashboard from root
//     if (pathname === "/" || pathname === "/en") {
//       return NextResponse.redirect(new URL(`/en/${userType}`, request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public (public folder assets)
//      */
//     "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
//   ],
// };

export { auth as middleware } from "@/auth";
