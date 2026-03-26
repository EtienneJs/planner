// middleware.ts (en la raíz del proyecto)
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute && req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next(); // Permitir rutas de auth
  }

  if (isApiRoute && !token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/purchases/:path*", "/api/events/:path*", "/api/products/:path*"],
};