import { NextRequest, NextResponse } from "next/server";
import { verifyMiddlewareToken } from "@/lib/middleware-auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  const protectedRoutes = [
    "/dashboard",
    "/career-dna",
    "/resume-builder",
    "/ai-mentor",
    "/premium",
    "/placement",
    "/interview",
    "/opportunities",
    "/verify",
    "/profile",
    "/jobs",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!isProtected) {
    if (isAuthPage && token) {
      if (await verifyMiddlewareToken(token)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!(await verifyMiddlewareToken(token))) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/career-dna",
    "/career-dna/:path*",
    "/resume-builder",
    "/resume-builder/:path*",
    "/ai-mentor",
    "/ai-mentor/:path*",
    "/premium",
    "/premium/:path*",
    "/placement",
    "/placement/:path*",
    "/interview",
    "/interview/:path*",
    "/opportunities",
    "/opportunities/:path*",
    "/verify",
    "/verify/:path*",
    "/profile",
    "/profile/:path*",
    "/jobs",
    "/jobs/:path*",
  ],
};