import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serializers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");

  const projects = await prisma.project.findMany({
    where: featured === "true" ? { featured: true } : undefined,
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    include: {
      technologies: {
        include: { technology: { select: { id: true, name: true, category: true } } },
      },
    },
  });

  const mapped = projects.map((project) => ({
    ...project,
    technologies: project.technologies.map((entry) => entry.technology),
  }));

  return NextResponse.json({ data: serialize(mapped) });
}
