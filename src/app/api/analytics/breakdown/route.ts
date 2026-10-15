import { NextResponse } from "next/server";
import { getBreakdown } from "@/lib/analytics";
import { breakdownSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = breakdownSchema.safeParse({
    datasetId: searchParams.get("datasetId"),
    dimension: searchParams.get("dimension") ?? "uf",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "datasetId is required; dimension must be uf|categoria" }, { status: 400 });
  }

  const rows = await getBreakdown(parsed.data.datasetId, parsed.data.dimension);
  return NextResponse.json({ data: rows, dimension: parsed.data.dimension });
}
