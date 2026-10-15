import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedSession } from "@/lib/auth";
import { projectInputSchema } from "@/lib/validation";
import { serialize } from "@/lib/serializers";

export async function GET() {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { technologies: { include: { technology: true } } },
  });
  return NextResponse.json({ data: serialize(projects) });
}

export async function POST(request: Request) {
  const session = await getAuthenticatedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = projectInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const { technologyIds, ...fields } = parsed.data;
  const project = await prisma.project.create({
    data: {
      ...fields,
      repoUrl: fields.repoUrl || null,
      liveUrl: fields.liveUrl || null,
      technologies: { create: technologyIds.map((technologyId) => ({ technologyId })) },
    },
    include: { technologies: { include: { technology: true } } },
  });

  return NextResponse.json({ data: serialize(project) }, { status: 201 });
}
