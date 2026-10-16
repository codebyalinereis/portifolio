import { NextResponse } from "next/server";
import { getTimeseries } from "@/lib/analytics";
import { timeseriesSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = timeseriesSchema.safeParse({
    datasetId: searchParams.get("datasetId"),
    metric: searchParams.get("metric") ?? "total",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "datasetId is required; metric must be total|receita_online|receita_loja" }, { status: 400 });
  }

  const points = await getTimeseries(parsed.data.datasetId);
  return NextResponse.json({ data: points, metric: parsed.data.metric });
}
