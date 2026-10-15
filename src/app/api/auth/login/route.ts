import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validation";
import { getAdminSession, getAdminPasswordHash } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = checkRateLimit(`login:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error" }, { status: 400 });
  }

  const emailOk = parsed.data.email.toLowerCase() === (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const passwordOk = await bcrypt.compare(parsed.data.password, getAdminPasswordHash());

  if (!emailOk || !passwordOk) {
    // Mensagem genérica — não revela qual campo errou
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  resetRateLimit(`login:${ip}`);

  const session = await getAdminSession();
  session.id = 1;
  session.email = parsed.data.email.toLowerCase();
  await session.save();

  return NextResponse.json({ ok: true });
}
