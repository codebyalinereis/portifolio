import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = checkRateLimit(`contact:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  // Honeypot preenchido → bot. Responde 200 para não entregar a detecção.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  await prisma.contactMessage.create({
    data: { name: parsed.data.name, email: parsed.data.email, message: parsed.data.message },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
