import type { NextRequest } from "next/server";
import { getCropAnalytics, parseFilters } from "@/lib/prices";

/**
 * Daily, monthly, yearly, seasonal and year x month analytics for one crop.
 * Query: source=all|tcb|dam|wfp, division=all|<name>, priceType=retail|wholesale, from/to=YYYY-MM-DD
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analytics = await getCropAnalytics(id, parseFilters(request.nextUrl.searchParams));
  if (!analytics) return Response.json({ error: "Unknown crop" }, { status: 404 });
  return Response.json(analytics);
}
