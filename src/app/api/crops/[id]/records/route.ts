import type { NextRequest } from "next/server";
import { getCropRecordsTable, parseFilters } from "@/lib/prices";

/** Raw observations (exact source prices), newest first. Same filters as the analytics route, plus limit (max 5000). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const search = request.nextUrl.searchParams;
  const limit = Math.min(5000, Math.max(1, Number(search.get("limit")) || 1000));
  const table = await getCropRecordsTable(id, parseFilters(search), limit);
  if (!table) return Response.json({ error: "Unknown crop" }, { status: 404 });
  return Response.json(table);
}
