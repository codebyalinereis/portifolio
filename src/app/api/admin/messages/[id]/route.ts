import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/auth";
import { serialize } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({ read: z.boolean() });

export async function PATCH(request: Request, { params }: Params) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error" }, { status: 400 });
  }

  const message = await prisma.contactMessage.update({ where: { id }, data: { read: parsed.data.read } });
  return NextResponse.json({ data: serialize(message) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
