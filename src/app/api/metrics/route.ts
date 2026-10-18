import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/data/metrics";

export const dynamic = "force-dynamic";

/** JSON mirror of the dashboard aggregates. */
export async function GET() {
  const { totals, byStage, funnel, sources, trend } = await getDashboardMetrics();
  return NextResponse.json({ totals, byStage, funnel, sources, trend });
}
