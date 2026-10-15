import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/auth";
import { technologyInputSchema } from "@/lib/validation";
import { serialize } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = technologyInputSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const technology = await prisma.technology.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: serialize(technology) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.technology.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
