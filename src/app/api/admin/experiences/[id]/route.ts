import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/auth";
import { experienceInputSchema } from "@/lib/validation";
import { serialize } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = experienceInputSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const experience = await prisma.experience.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: serialize(experience) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.experience.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
