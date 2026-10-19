// Trading Corporation of Bangladesh (TCB): daily retail prices for Dhaka city.
// TCB publishes one XLSX per day on https://tcb.gov.bd/pages/daily-rmps (10 files per page).
// Each sheet carries today's min/max price plus the price one week, one month and one year earlier.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { matchTcbName } from "../../src/lib/catalogue";
import type { PriceRecord, SourceMeta } from "../../src/lib/types";
import { fetchBuffer, fetchText, log, sleep } from "./http";

const LIST_URL = "https://tcb.gov.bd/pages/daily-rmps";
const FILE_HOST = "objectstorage.ap-dcc-gazipur-1.oraclecloud15.com";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toAsciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
const clean = (s: string) => s.replace(/\s+/g, " ").trim();

const BN_MONTHS: Record<string, number> = {
  জানুয়ারি: 1, জানুয়ারী: 1, ফেব্রুয়ারি: 2, ফেব্রুয়ারী: 2, মার্চ: 3, এপ্রিল: 4, মে: 5, জুন: 6,
  জুলাই: 7, আগস্ট: 8, আগষ্ট: 8, সেপ্টেম্বর: 9, অক্টোবর: 10, নভেম্বর: 11, ডিসেম্বর: 12,
};

function cellValue(v: ExcelJS.CellValue): unknown {
  if (v && typeof v === "object" && !(v instanceof Date)) {
    if ("result" in v) return v.result;
    if ("richText" in v) return v.richText.map((t) => t.text).join("");
  }
  return v;
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(toAsciiDigits(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Parses "রবিবার ১৮ অক্টোবর ২০২৬ খ্রিঃ" style headings, used when a sheet has no real date cells. */
function parseBengaliDate(text: string): string | null {
  const m = toAsciiDigits(text).match(/(\d{1,2})\s+(\S+)\s+(\d{4})/);
  const month = m && BN_MONTHS[m[2]];
  if (!m || !month) return null;
  return `${m[3]}-${String(month).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

/** Convert a TCB unit label to a multiplier into the crop's unit. */
function unitFactor(label: string, cropUnit: "kg" | "piece"): number | null {
  const u = clean(label);
  if (cropUnit === "kg" && /কেজি/.test(u) && !/\d|[০-৯]/.test(u.replace(/^প্রতি/, ""))) return 1;
  if (cropUnit === "piece" && /হালি/.test(u)) return 1 / 4;
  if (cropUnit === "piece" && /(পিস|টি)/.test(u)) return 1;
  return null;
}

interface ParsedSheet {
  /** Date of the report itself. */
  date: string;
  records: PriceRecord[];
  unmatched: string[];
}

export async function parseTcbSheet(buffer: ArrayBuffer): Promise<ParsedSheet> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error("workbook has no sheets");

  // Locate the row holding the comparison dates; consecutive equal dates form a min/max pair.
  let pairs: { date: string; minCol: number; maxCol: number }[] = [];
  let headingDate: string | null = null;
  ws.eachRow((row) => {
    if (pairs.length) return;
    const values = (row.values as ExcelJS.CellValue[]).map(cellValue);
    if (!headingDate) {
      const text = values.find((v): v is string => typeof v === "string" && /খ্রি/.test(v));
      if (text) headingDate = parseBengaliDate(text);
    }
    const found: typeof pairs = [];
    for (let c = 1; c < values.length - 1; c++) {
      const a = values[c];
      const b = values[c + 1];
      if (a instanceof Date && b instanceof Date && isoDate(a) === isoDate(b)) {
        found.push({ date: isoDate(a), minCol: c, maxCol: c + 1 });
        c++;
      }
    }
    if (found.length) pairs = found;
  });
  if (!pairs.length) {
    if (!headingDate) throw new Error("could not find report date");
    pairs = [{ date: headingDate, minCol: 3, maxCol: 4 }];
  }

  const records: PriceRecord[] = [];
  const unmatched: string[] = [];
  // Later blocks repeat items (e.g. "items whose price changed"); only the first row per crop is the price table.
  const seen = new Set<string>();
  let done = false;
  ws.eachRow((row) => {
    if (done) return;
    const values = (row.values as ExcelJS.CellValue[]).map(cellValue);
    const name = typeof values[1] === "string" ? clean(values[1]) : "";
    // The block after this heading repeats items whose price moved; ignore it.
    if (name.startsWith("যে সকল পণ্যের")) {
      done = true;
      return;
    }
    const unit = typeof values[2] === "string" ? values[2] : "";
    if (!name || !unit || toNumber(values[pairs[0].minCol]) === null) return;

    const crop = matchTcbName(name);
    if (!crop) {
      unmatched.push(name);
      return;
    }
    if (seen.has(crop.id)) return;
    seen.add(crop.id);
    const factor = unitFactor(unit, crop.unit);
    if (factor === null) {
      unmatched.push(`${name} [${clean(unit)}]`);
      return;
    }
    for (const [i, pair] of pairs.entries()) {
      const min = toNumber(values[pair.minCol]);
      const max = toNumber(values[pair.maxCol]);
      // TCB writes 0 when an item was not available in the market.
      if (!min || !max || min <= 0 || max <= 0) continue;
      const lo = Math.min(min, max) * factor;
      const hi = Math.max(min, max) * factor;
      records.push({
        crop: crop.id,
        date: pair.date,
        granularity: "day",
        source: "tcb",
        division: "Dhaka",
        market: "Dhaka city (TCB)",
        priceType: "retail",
        priceMin: round(lo),
        priceMax: round(hi),
        price: round((lo + hi) / 2),
        ...(i > 0 && { derived: true }),
      });
    }
  });

  return { date: pairs[0].date, records, unmatched };
}

const round = (n: number) => Math.round(n * 100) / 100;

async function listFileUrls(pages: number, delayMs: number): Promise<string[]> {
  const urls: string[] = [];
  for (let page = 1; page <= pages; page++) {
    const html = await fetchText(page === 1 ? LIST_URL : `${LIST_URL}?page=${page}`);
    const found = [...html.matchAll(/href="(https:\/\/[^"]+\.xlsx)"/gi)]
      .map((m) => m[1])
      .filter((u) => new URL(u).host === FILE_HOST);
    if (!found.length) break;
    for (const u of found) if (!urls.includes(u)) urls.push(u);
    await sleep(delayMs);
  }
  return urls;
}

export async function collectTcb(opts: {
  pages: number;
  delayMs: number;
  processedFiles: Set<string>;
  rawDir: string;
}): Promise<{ records: PriceRecord[]; meta: SourceMeta; newFiles: string[] }> {
  log(`TCB: listing ${opts.pages} page(s) of daily reports`);
  const urls = await listFileUrls(opts.pages, opts.delayMs);
  const todo = urls.filter((u) => !opts.processedFiles.has(u));
  log(`TCB: ${urls.length} files listed, ${todo.length} new`);
  await mkdir(opts.rawDir, { recursive: true });

  const records: PriceRecord[] = [];
  const newFiles: string[] = [];
  const unmatched = new Set<string>();
  let failures = 0;
  for (const [i, url] of todo.entries()) {
    const file = path.join(opts.rawDir, path.basename(new URL(url).pathname));
    try {
      let buffer: ArrayBuffer;
      try {
        const cached = await readFile(file);
        buffer = cached.buffer.slice(cached.byteOffset, cached.byteOffset + cached.byteLength);
      } catch {
        buffer = await fetchBuffer(url);
        await writeFile(file, Buffer.from(buffer));
        await sleep(opts.delayMs);
      }
      const sheet = await parseTcbSheet(buffer);
      records.push(...sheet.records);
      sheet.unmatched.forEach((n) => unmatched.add(n));
      newFiles.push(url);
      if ((i + 1) % 10 === 0 || i === todo.length - 1) log(`TCB: ${i + 1}/${todo.length} parsed (latest ${sheet.date})`);
    } catch (err) {
      failures++;
      log(`TCB: failed ${url}: ${(err as Error).message}`);
    }
  }
  if (failures) log(`TCB: ${failures} file(s) failed; they will be retried next run`);
  log(`TCB: ${records.length} records from ${newFiles.length} files`);
  if (process.env.DEBUG_UNMATCHED) log(`TCB: unmatched rows: ${[...unmatched].join(", ")}`);

  return {
    records,
    newFiles,
    meta: {
      id: "tcb",
      name: "TCB daily retail market prices (Dhaka)",
      url: LIST_URL,
      frequency: "daily",
      coverage: "Dhaka city retail markets, daily min/max",
      licence: "Government of Bangladesh public information",
      fetchedAt: new Date().toISOString(),
      records: 0, // filled in after merging
    },
  };
}
