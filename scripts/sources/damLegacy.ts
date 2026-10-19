// DAM's older market price system (market.dam.gov.bd). It holds retail prices for Dhaka city markets
// for roughly October 2017 to mid-2020, with scattered dates outside that window. Each report request
// takes about 30 seconds, so the collector samples a few days per month instead of every day.

import { matchBnName } from "../../src/lib/catalogue";
import type { PriceRecord } from "../../src/lib/types";
import { log, sleep } from "./http";

const BASE = "https://market.dam.gov.bd";
const USER_AGENT = "SobjiBazarCollector/0.1 (crop price research; low request rate)";
// Dhaka division / Dhaka district / Dhaka Sadar upazila, as the form expects them.
const AREA = { division: "1|ঢাকা", district: "1|ঢাকা ", subdistrict: "178|ঢাকা সদর " };
const RETAIL = "4";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toAscii = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
const decode = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

class Session {
  private cookies = new Map<string, string>();
  token = "";

  private remember(res: Response) {
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      this.cookies.set(pair.slice(0, i).trim(), pair.slice(i + 1));
    }
  }

  async request(path: string, form?: [string, string][]): Promise<string> {
    const res = await fetch(`${BASE}${path}`, {
      method: form ? "POST" : "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "),
        ...(form && { "Content-Type": "application/x-www-form-urlencoded" }),
      },
      body: form ? new URLSearchParams([["csrf_webspice_tkn", this.token], ...form]) : undefined,
      signal: AbortSignal.timeout(180_000),
    });
    this.remember(res);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return res.text();
  }

  async open() {
    const html = await this.request("/market_daily_price_report");
    this.token = html.match(/name="csrf_webspice_tkn" value="([^"]+)"/)?.[1] ?? "";
    if (!this.token) throw new Error("no CSRF token on report form");
  }
}

/** Parse "৪০ - ৬০" (Bengali digits, optional thousands commas) into [40, 60]. */
function parseRange(text: string): [number, number] | null {
  const nums = toAscii(text)
    .replace(/,/g, "")
    .match(/\d+(\.\d+)?/g)
    ?.map(Number);
  if (!nums?.length) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

function unitQty(unit: string): { unit: "kg" | "piece"; qty: number } | null {
  const u = toAscii(unit);
  if (/কিলো|কেজি/.test(u)) return { unit: "kg", qty: 1 };
  const pcs = u.match(/(\d+)\s*-?\s*টি/);
  if (pcs) return { unit: "piece", qty: Number(pcs[1]) };
  return null;
}

/**
 * The report table lists each product group as a cell with a rowspan, followed by repeating
 * [name, unit, "min - max"] cells. Most rows are missing their opening <tr>, so cells are read in order.
 */
export function parseLegacyReport(html: string, date: string): PriceRecord[] {
  const start = html.lastIndexOf("<table");
  if (start < 0) return [];
  const table = html.slice(start, html.indexOf("</table>", start));
  const cells = [...table.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/gi)].map((m) => ({ group: /rowspan/i.test(m[1]), text: decode(m[2]) }));
  const out: PriceRecord[] = [];
  let i = cells.findIndex((c) => c.group);
  while (i >= 0 && i < cells.length) {
    if (cells[i].group) {
      i++;
      continue;
    }
    const [name, unit, price] = cells.slice(i, i + 3).map((c) => c.text);
    i += 3;
    if (!name || !price) continue;
    const crop = matchBnName(name);
    const u = unitQty(unit ?? "");
    const range = parseRange(price);
    if (!crop || !u || u.unit !== crop.unit || !range || range[0] <= 0) continue;
    const lo = range[0] / u.qty;
    const hi = range[1] / u.qty;
    if (hi / lo > 3) continue;
    out.push({
      crop: crop.id,
      date,
      granularity: "day",
      source: "dam",
      division: "Dhaka",
      market: "DAM Dhaka city markets (old system)",
      priceType: "retail",
      variant: name,
      priceMin: Math.round(lo * 100) / 100,
      priceMax: Math.round(hi * 100) / 100,
      price: Math.round(((lo + hi) / 2) * 100) / 100,
    });
  }
  return out;
}

export async function collectDamLegacy(opts: {
  processed: Set<string>;
  from: string;
  to: string;
  days: number[];
  delayMs: number;
}): Promise<{ records: PriceRecord[]; done: string[] }> {
  const dates: string[] = [];
  for (let d = new Date(`${opts.from.slice(0, 7)}-01T00:00:00Z`); d.toISOString().slice(0, 10) <= opts.to; d.setUTCMonth(d.getUTCMonth() + 1)) {
    for (const day of opts.days) {
      const iso = `${d.toISOString().slice(0, 7)}-${String(day).padStart(2, "0")}`;
      if (iso >= opts.from && iso <= opts.to && !opts.processed.has(`damlegacy:${iso}`)) dates.push(iso);
    }
  }
  log(`DAM (old system): ${dates.length} date(s) to fetch, about ${Math.ceil((dates.length * 32) / 60)} min`);
  if (!dates.length) return { records: [], done: [] };

  const session = new Session();
  await session.open();
  const marketsHtml = await session.request("/get_market_list_ban", [["data_id[]", AREA.subdistrict]]);
  const markets = [...marketsHtml.matchAll(/value="([^"]+)"/g)].map((m) => m[1]);

  const records: PriceRecord[] = [];
  const done: string[] = [];
  for (const [i, date] of dates.entries()) {
    try {
      const html = await session.request("/market_daily_price_report", [
        ["Division_id[]", AREA.division],
        ["District_id[]", AREA.district],
        ["Subdistrict_id[]", AREA.subdistrict],
        ...markets.map((m): [string, string] => ["Market_id[]", m]),
        ["PriceType_id[]", RETAIL],
        ["date", date],
        ["filter", "Generate Report"],
      ]);
      const rows = parseLegacyReport(html, date);
      records.push(...rows);
      done.push(`damlegacy:${date}`);
      if ((i + 1) % 10 === 0 || i === dates.length - 1) log(`DAM (old system): ${i + 1}/${dates.length} (${date}: ${rows.length} prices)`);
    } catch (err) {
      log(`DAM (old system): ${date} failed: ${(err as Error).message}`);
    }
    await sleep(opts.delayMs);
  }
  log(`DAM (old system): ${records.length} records`);
  return { records, done };
}
