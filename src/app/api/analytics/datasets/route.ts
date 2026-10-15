import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serializers";

export async function GET() {
  const datasets = await prisma.dataset.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, source: true, status: true, rowCount: true, createdAt: true },
  });
  return NextResponse.json({ data: serialize(datasets) });
}
