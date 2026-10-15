import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/auth";
import { technologyInputSchema } from "@/lib/validation";
import { serialize } from "@/lib/serializers";

export async function GET() {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const technologies = await prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: serialize(technologies) });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = technologyInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const technology = await prisma.technology.create({ data: parsed.data });
  return NextResponse.json({ data: serialize(technology) }, { status: 201 });
}
