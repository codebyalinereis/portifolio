import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/auth";
import { projectInputSchema } from "@/lib/validation";
import { serialize } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = projectInputSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const { technologyIds, ...fields } = parsed.data;
  const cleaned = {
    ...fields,
    ...(fields.repoUrl !== undefined ? { repoUrl: fields.repoUrl || null } : {}),
    ...(fields.liveUrl !== undefined ? { liveUrl: fields.liveUrl || null } : {}),
  };

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...cleaned,
      ...(technologyIds
        ? {
            technologies: {
              deleteMany: {},
              create: technologyIds.map((technologyId) => ({ technologyId })),
            },
          }
        : {}),
    },
    include: { technologies: { include: { technology: true } } },
  });

  return NextResponse.json({ data: serialize(project) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
