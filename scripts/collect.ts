// Collects crop prices from public Bangladeshi sources into data/prices.json.
//
//   npm run collect                 # WFP + latest ~1 year of TCB daily reports
//   npm run collect -- --pages=5    # only the newest 5 TCB listing pages (10 reports each)
//   npm run collect -- --skip-wfp   # skip WFP (also --skip-tcb, --skip-dam)
//   npm run collect -- --legacy     # also sample DAM's old system, 2017-2021 (about 50 min)
//
// Re-runs are incremental: TCB files already parsed are skipped, WFP is re-downloaded in full.

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalDivision } from "../src/lib/catalogue";
import type { Dataset, PriceRecord, SourceMeta } from "../src/lib/types";
import { collectDam, dropOutliers } from "./sources/dam";
import { collectDamLegacy } from "./sources/damLegacy";
import { log } from "./sources/http";
import { collectTcb } from "./sources/tcb";
import { collectWfp } from "./sources/wfp";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "prices.json");
const RAW_DIR = path.join(DATA_DIR, "raw", "tcb");

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  return hit?.includes("=") ? hit.split("=")[1] : hit ? "true" : undefined;
}

async function loadExisting(): Promise<Dataset> {
  try {
    const dataset: Dataset = JSON.parse(await readFile(DATA_FILE, "utf8"));
    // Files written before granularity/canonical divisions existed.
    for (const r of dataset.records) {
      r.granularity ??= r.source === "wfp" ? "month" : "day";
      r.division = canonicalDivision(r.division);
    }
    return dataset;
  } catch {
    return { generatedAt: "", sources: [], processedFiles: [], records: [] };
  }
}

const keyOf = (r: PriceRecord) => [r.source, r.crop, r.market, r.variant ?? "", r.priceType, r.granularity, r.date].join("|");

/** Merge records, letting a direct observation replace a derived one for the same key. */
function merge(base: PriceRecord[], incoming: PriceRecord[]): PriceRecord[] {
  const byKey = new Map(base.map((r) => [keyOf(r), r]));
  for (const r of incoming) {
    const existing = byKey.get(keyOf(r));
    if (!existing || (existing.derived && !r.derived)) byKey.set(keyOf(r), r);
  }
  return [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date) || a.crop.localeCompare(b.crop));
}

async function main() {
  const pages = Number(arg("pages") ?? 37);
  const delayMs = Number(arg("delay") ?? 800);
  const dataset = await loadExisting();
  const sources = new Map<string, SourceMeta>(dataset.sources.map((s) => [s.id, s]));
  let records = dataset.records;

  if (!arg("skip-wfp")) {
    try {
      const wfp = await collectWfp();
      records = merge(records.filter((r) => r.source !== "wfp"), wfp.records);
      sources.set("wfp", wfp.meta);
    } catch (err) {
      log(`WFP: failed, keeping previous data: ${(err as Error).message}`);
    }
  }

  if (!arg("skip-tcb")) {
    const processed = new Set(dataset.processedFiles);
    const tcb = await collectTcb({ pages, delayMs, processedFiles: processed, rawDir: RAW_DIR });
    records = merge(records, tcb.records);
    tcb.newFiles.forEach((f) => processed.add(f));
    dataset.processedFiles = [...processed];
    sources.set("tcb", { ...tcb.meta, records: records.filter((r) => r.source === "tcb").length });
  }

  if (!arg("skip-dam")) {
    const processed = new Set(dataset.processedFiles);
    const dam = await collectDam({ processed, delayMs: Number(arg("delay") ?? 400), from: arg("dam-from") });
    const { kept, dropped } = dropOutliers(merge(records.filter((r) => r.source === "dam"), dam.records));
    if (dropped) log(`DAM: ${dropped} outlier(s) removed from the full series`);
    records = merge(records.filter((r) => r.source !== "dam"), kept);
    dam.done.forEach((d) => processed.add(d));
    dataset.processedFiles = [...processed];
    sources.set("dam", { ...dam.meta, records: kept.length });
  }

  // Slow (about 30 s per request), so only on request: npm run collect -- --legacy
  if (arg("legacy")) {
    const processed = new Set(dataset.processedFiles);
    const legacy = await collectDamLegacy({
      processed,
      from: arg("legacy-from") ?? "2017-09-01",
      to: arg("legacy-to") ?? "2021-09-30",
      days: (arg("legacy-days") ?? "5,20").split(",").map(Number),
      delayMs: 1000,
    });
    const { kept } = dropOutliers(merge(records.filter((r) => r.source === "dam"), legacy.records));
    records = merge(records.filter((r) => r.source !== "dam"), kept);
    legacy.done.forEach((d) => processed.add(d));
    dataset.processedFiles = [...processed];
    const dam = sources.get("dam");
    if (dam) sources.set("dam", { ...dam, records: kept.length, coverage: `${dam.coverage}; Dhaka city retail samples from the old system, 2017-2021` });
  }

  const out: Dataset = {
    generatedAt: new Date().toISOString(),
    sources: [...sources.values()],
    processedFiles: dataset.processedFiles,
    records,
  };
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(out));
  await rename(tmp, DATA_FILE);
  log(`Saved ${records.length} records to ${path.relative(process.cwd(), DATA_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
