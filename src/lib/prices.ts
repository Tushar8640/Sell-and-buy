// Read models used by pages and API routes. Rendered per request so a fresh `npm run collect` shows
// up immediately; the repository keeps the parsed JSON in memory until the file changes.

import { connection } from "next/server";
import { analyseCrop, rawRecords, type CropAnalytics, type Filters } from "./analytics";
import { CROPS, CROP_BY_ID, type Crop } from "./catalogue";
import { getCropRecords, getMeta } from "./repository";

export interface OverviewRow {
  crop: Crop;
  latest: CropAnalytics["latest"];
  monthChange: number | null;
  peakMonth: number | null;
  lowMonth: number | null;
  seasonal: (number | null)[];
  observations: number;
  first: string;
}

export async function getOverview() {
  await connection();

  const rows: OverviewRow[] = [];
  for (const crop of CROPS) {
    const a = analyseCrop(await getCropRecords(crop.id));
    if (!a.observations) continue;
    rows.push({
      crop,
      latest: a.latest,
      monthChange: a.change.month?.pct ?? null,
      peakMonth: a.peakMonth,
      lowMonth: a.lowMonth,
      seasonal: a.seasonal.map((s) => s.index),
      observations: a.observations,
      first: a.available.first,
    });
  }
  return { rows, meta: await getMeta() };
}

export async function getCropAnalytics(cropId: string, filters: Filters = {}) {
  await connection();
  if (!CROP_BY_ID.has(cropId)) return null;
  return analyseCrop(await getCropRecords(cropId), filters);
}

export async function getCropRecordsTable(cropId: string, filters: Filters, limit?: number) {
  await connection();
  if (!CROP_BY_ID.has(cropId)) return null;
  return rawRecords(await getCropRecords(cropId), filters, limit);
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Read filters from a query string, ignoring anything malformed. */
export function parseFilters(search: URLSearchParams): Filters {
  const source = search.get("source");
  const priceType = search.get("priceType");
  const from = search.get("from");
  const to = search.get("to");
  return {
    source: source === "tcb" || source === "wfp" || source === "dam" ? source : "all",
    division: (search.get("division") ?? "all").slice(0, 64),
    priceType: priceType === "wholesale" ? "wholesale" : "retail",
    from: from && ISO_DAY.test(from) ? from : undefined,
    to: to && ISO_DAY.test(to) ? to : undefined,
  };
}
