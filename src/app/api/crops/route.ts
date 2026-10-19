import { getOverview } from "@/lib/prices";

/** All tracked crops with latest price and seasonal index. */
export async function GET() {
  const { rows, meta } = await getOverview();
  return Response.json({
    generatedAt: meta.generatedAt,
    sources: meta.sources,
    crops: rows.map(({ crop, ...rest }) => ({ id: crop.id, en: crop.en, bn: crop.bn, group: crop.group, unit: crop.unit, ...rest })),
  });
}
