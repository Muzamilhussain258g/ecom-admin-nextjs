import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoute = [
  "/sign-in",
  "/sign-up",
  // "/forgot-password",
  // "/errors",
];

const protectedRoute = [
  "/calendar",
  "/chat",
  "/dashboard-2",
  "/faqs",
  "/mail",
  "/pricing",
  "/products",
  "/variants",
  "/categories",
  "/collections",
  "/settings",
  "/tasks",
  "/users",
];

export async function proxy(request: NextRequest) {
  const aT =await request.cookies.get("_at")?.value;
  const currentPath = request.nextUrl.pathname;

  const isPublicRoute = publicRoute.some(
    (route) =>
      currentPath === route || currentPath.startsWith(`${route}/`)
  );

  const isProtectedRoute = protectedRoute.some(
    (route) =>
      currentPath === route || currentPath.startsWith(`${route}/`)
  );

  // Logged-in users cannot access sign-in/sign-up
  if (isPublicRoute && aT) {
    return NextResponse.redirect(
      new URL("/dashboard-2", request.url)
    );
  }

  // Guests cannot access protected routes
  if (isProtectedRoute && !aT) {
    return NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/calendar/:path*",
    "/chat/:path*",
    "/dashboard-2/:path*",
    "/faqs/:path*",
    "/mail/:path*",
    "/pricing/:path*",
    "/products/:path*",
    "/variants/:path*",
    "/categories/:path*",
    "/collections/:path*",
    "/settings/:path*",
    "/tasks/:path*",
    "/users/:path*",
  ],
};
