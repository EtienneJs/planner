/**
 * Next.js 16 usa este archivo como middleware (no usar `middleware.ts` a la vez).
 * Protege el dashboard y las APIs de events / products / purchases.
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedApiPrefixes = ["/api/purchases", "/api/events", "/api/products"];

function isProtectedApi(pathname: string) {
  return protectedApiPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute && pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") && !token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (isApiRoute && isProtectedApi(pathname) && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/purchases/:path*",
    "/api/events/:path*",
    "/api/products/:path*",
  ],
};
