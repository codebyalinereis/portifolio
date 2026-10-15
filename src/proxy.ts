import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * Guarda leve de rota do /admin: apenas checa a presença do cookie de sessão.
 * A validação real (desselação) acontece no layout do /admin e nas API routes —
 * defense in depth. (Next 16: middleware foi renomeado para proxy.)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!request.cookies.get(SESSION_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
