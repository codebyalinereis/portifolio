import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serializers";

export async function GET() {
  const technologies = await prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: serialize(technologies) });
}
