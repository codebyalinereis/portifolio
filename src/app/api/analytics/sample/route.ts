import { NextResponse } from "next/server";
import { getOrderSample } from "@/lib/analytics";
import { datasetIdSchema } from "@/lib/validation";
import { serialize } from "@/lib/serializers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = datasetIdSchema.safeParse({ datasetId: searchParams.get("datasetId") });
  if (!parsed.success) {
    return NextResponse.json({ error: "datasetId is required" }, { status: 400 });
  }

  const rows = await getOrderSample(parsed.data.datasetId, 50);
  return NextResponse.json({ data: serialize(rows) });
}
