import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runEtl } from "@/lib/csv/load";

// Nota: `export const runtime` é incompatível com cacheComponents (Next 16);
// route handlers já rodam no runtime Node por padrão.

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Field 'file' is required" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "Only .csv files are accepted" }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 413 });
  }

  const dataset = await prisma.dataset.create({
    data: {
      name: file.name.replace(/\.csv$/i, "").slice(0, 120),
      originalFilename: file.name,
      source: "upload",
      status: "PROCESSING",
    },
  });

  const buffer = Buffer.from(await file.arrayBuffer());

  // Fire-and-forget: job roda em background no processo Node.
  // Decisão consciente para demo — em produção: BullMQ + Redis (ver /docs).
  void runEtl(dataset.id, buffer);

  return NextResponse.json({ datasetId: dataset.id, status: "PROCESSING" }, { status: 202 });
}
