import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname === "/" || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Protected routes
  if (!req.auth) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Banned users
  if (req.auth.user?.isBanned) {
    return NextResponse.redirect(new URL("/auth/banned", req.url));
  }

  // Webmaster-only routes
  if (pathname.startsWith("/admin") && !req.auth.user?.isWebmaster) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
