import { NextResponse } from "next/server";
import { getKpis } from "@/lib/analytics";
import { datasetIdSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = datasetIdSchema.safeParse({ datasetId: searchParams.get("datasetId") });
  if (!parsed.success) {
    return NextResponse.json({ error: "datasetId is required" }, { status: 400 });
  }

  const kpis = await getKpis(parsed.data.datasetId);
  return NextResponse.json({ data: kpis });
}
