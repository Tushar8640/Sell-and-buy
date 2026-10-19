// WFP Bangladesh food prices, published monthly on the Humanitarian Data Exchange (HDX).
// Licence: Creative Commons Attribution for Intergovernmental Organisations (CC BY-IGO).

import Papa from "papaparse";
import { CROPS, canonicalDivision } from "../../src/lib/catalogue";
import type { PriceRecord, SourceMeta } from "../../src/lib/types";
import { fetchText, log } from "./http";

const PACKAGE_API = "https://data.humdata.org/api/3/action/package_show?id=wfp-food-prices-for-bangladesh";
const DATASET_PAGE = "https://data.humdata.org/dataset/wfp-food-prices-for-bangladesh";

interface WfpRow {
  date: string;
  admin1: string;
  market: string;
  commodity: string;
  unit: string;
  pricetype: string;
  currency: string;
  price: string;
}

const cropByWfpName = new Map(CROPS.flatMap((c) => (c.wfp ?? []).map((name) => [name, c] as const)));

/** "KG" -> 1 kg, "100 KG" -> 100 kg, "1 piece" -> 1 piece. Returns null for units we don't handle. */
function parseUnit(unit: string): { unit: "kg" | "piece"; qty: number } | null {
  const m = unit.trim().match(/^(\d+(?:\.\d+)?)?\s*(kg|piece|pcs|unit)s?$/i);
  if (!m) return null;
  const qty = m[1] ? Number(m[1]) : 1;
  return { unit: m[2].toLowerCase() === "kg" ? "kg" : "piece", qty };
}

async function resolveCsvUrl(): Promise<string> {
  const pkg = JSON.parse(await fetchText(PACKAGE_API));
  const resource = pkg.result.resources.find((r: { url: string }) => r.url.endsWith("wfp_food_prices_bgd.csv"));
  if (!resource) throw new Error("wfp_food_prices_bgd.csv not found in HDX package");
  return resource.url;
}

export async function collectWfp(): Promise<{ records: PriceRecord[]; meta: SourceMeta }> {
  const csvUrl = await resolveCsvUrl();
  log(`WFP: downloading ${csvUrl}`);
  const rows = Papa.parse<WfpRow>(await fetchText(csvUrl), { header: true, skipEmptyLines: true }).data;

  const records: PriceRecord[] = [];
  const skippedUnits = new Set<string>();
  for (const row of rows) {
    const crop = cropByWfpName.get(row.commodity);
    if (!crop || row.currency !== "BDT") continue;
    const unit = parseUnit(row.unit);
    const price = Number(row.price);
    if (!unit || unit.unit !== crop.unit || !(price > 0)) {
      skippedUnits.add(`${row.commodity} [${row.unit}]`);
      continue;
    }
    records.push({
      crop: crop.id,
      date: row.date,
      granularity: "month",
      source: "wfp",
      division: canonicalDivision(row.admin1),
      market: row.market,
      priceType: row.pricetype.toLowerCase() === "wholesale" ? "wholesale" : "retail",
      price: Math.round((price / unit.qty) * 100) / 100,
    });
  }
  if (skippedUnits.size) log(`WFP: skipped rows with unexpected units: ${[...skippedUnits].join(", ")}`);

  const dates = records.map((r) => r.date).sort();
  log(`WFP: ${records.length} records (${dates[0]} to ${dates.at(-1)})`);
  return {
    records,
    meta: {
      id: "wfp",
      name: "WFP Bangladesh food prices (HDX)",
      url: DATASET_PAGE,
      frequency: "monthly",
      coverage: "Markets across all divisions, monthly average",
      licence: "CC BY-IGO",
      fetchedAt: new Date().toISOString(),
      records: records.length,
    },
  };
}
