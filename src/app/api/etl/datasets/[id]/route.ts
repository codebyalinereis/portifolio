import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serializers";
import { getAuthenticatedSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const dataset = await prisma.dataset.findUnique({ where: { id } });
  if (!dataset) return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  return NextResponse.json({ data: serialize(dataset) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const dataset = await prisma.dataset.findUnique({ where: { id }, select: { id: true } });
  if (!dataset) return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  await prisma.dataset.delete({ where: { id } }); // cascade remove as notas
  return NextResponse.json({ ok: true });
}
