// The only module that knows prices live in data/prices.json.
// To move to a database, reimplement these functions; callers stay unchanged.

import "server-only";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { canonicalDivision } from "./catalogue";
import type { Dataset, PriceRecord } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "prices.json");

const EMPTY: Dataset = { generatedAt: "", sources: [], processedFiles: [], records: [] };

let memo: { mtimeMs: number; dataset: Dataset; byCrop: Map<string, PriceRecord[]> } | null = null;

async function load() {
  let mtimeMs: number;
  try {
    mtimeMs = (await stat(DATA_FILE)).mtimeMs;
  } catch {
    return { dataset: EMPTY, byCrop: new Map<string, PriceRecord[]>() };
  }
  if (memo?.mtimeMs !== mtimeMs) {
    const dataset: Dataset = JSON.parse(await readFile(DATA_FILE, "utf8"));
    const byCrop = new Map<string, PriceRecord[]>();
    for (const r of dataset.records) {
      // Files written before these fields existed.
      r.granularity ??= r.source === "wfp" ? "month" : "day";
      r.division = canonicalDivision(r.division);
      const list = byCrop.get(r.crop);
      if (list) list.push(r);
      else byCrop.set(r.crop, [r]);
    }
    memo = { mtimeMs, dataset, byCrop };
  }
  return memo;
}

export async function getMeta(): Promise<Omit<Dataset, "records" | "processedFiles"> & { recordCount: number }> {
  const { dataset } = await load();
  return { generatedAt: dataset.generatedAt, sources: dataset.sources, recordCount: dataset.records.length };
}

export async function getCropRecords(cropId: string): Promise<PriceRecord[]> {
  return (await load()).byCrop.get(cropId) ?? [];
}
