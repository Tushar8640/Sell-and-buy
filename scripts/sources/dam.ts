// Department of Agricultural Marketing (DAM) price data, served by the Ministry of Agriculture's
// "Krishi Sheba" portal (https://moa-services.com/market-directory). Prices are collected by DAM
// field offices from markets in every district; the API returns min/max retail and wholesale prices
// averaged over the markets in the requested divisions and date range. Data starts in June 2025.
//
// Two passes:
//   daily   - division-wise report, one request per day             -> national daily average
//             (that report ignores its division filter, so it is always national)
//   monthly - market monthly report, one request per division and   -> division monthly average
//             commodity, covering every month since DAM_START

import { CROPS, NATIONAL, canonicalDivision } from "../../src/lib/catalogue";
import type { PriceRecord, SourceMeta } from "../../src/lib/types";
import { fetchText, log, sleep } from "./http";

const API = "https://moa-services.com/agri-service";
const REPORT = `${API}/crop-price-info/reports/price-report/division-wise-average-price-report`;
const MONTHLY = `${API}/crop-price-info/reports/price-report/market-monthly-price-report`;
const PORTAL = "https://moa-services.com/market-directory/division-wise-average-market-price-report";
export const DAM_START = "2025-06-01";

interface Option {
  value: number;
  text_en: string;
  text_bn: string;
}

interface Commodity extends Option {
  commodity_group_id: number;
  commodity_sub_group_id: number;
}

interface Market {
  value: number;
  division_id: number;
}

interface MonthlyRow {
  price_date: string;
  unit_retail: number;
  unit_whole_sale: number;
  a_r_lowestPrice: string | null;
  a_r_howestPrice: string | null;
  a_w_lowestPrice: string | null;
  a_w_highestPrice: string | null;
}

interface Row {
  commodity_id: number;
  unit_retail: number;
  unit_whole_sale: number;
  avg_retail_lowestPrice: string | null;
  avg_retail_howestPrice: string | null;
  avg_wholesale_lowestPrice: string | null;
  avg_wholesale_highestPrice: string | null;
}

/** DAM measurement unit id -> quantity in the crop's unit. Units not listed are skipped. */
const UNIT_QTY: Record<number, { unit: "kg" | "piece"; qty: number }> = {
  1: { unit: "kg", qty: 100 }, // Quintal
  2: { unit: "kg", qty: 1 }, // Kilogram
  18: { unit: "kg", qty: 1 }, // 1 KG
  11: { unit: "kg", qty: 2 },
  12: { unit: "kg", qty: 12 },
  15: { unit: "kg", qty: 50 }, // 1 bag (50 kg)
  4: { unit: "piece", qty: 1 },
  5: { unit: "piece", qty: 4 },
  6: { unit: "piece", qty: 48 },
  7: { unit: "piece", qty: 80 },
  8: { unit: "piece", qty: 100 },
  9: { unit: "piece", qty: 1000 },
};

const cropByDamId = new Map(CROPS.flatMap((c) => (c.dam ?? []).map((id) => [id, c] as const)));

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const round = (n: number) => Math.round(n * 100) / 100;

function* days(from: string, to: string) {
  for (let d = new Date(from); isoDay(d) <= to; d.setUTCDate(d.getUTCDate() + 1)) yield isoDay(d);
}

async function queryMonthly(c: Commodity, marketIds: number[], fromYear: number, toYear: number): Promise<MonthlyRow[]> {
  const res = await fetch(MONTHLY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "SobjiBazarCollector/0.1 (crop price research; low request rate)" },
    body: JSON.stringify({
      division_id: [],
      district_id: [],
      upazila_id: [],
      market_id: marketIds,
      commodity_group_id: c.commodity_group_id,
      commodity_sub_group_id: c.commodity_sub_group_id,
      commodity_id: c.value,
      year_from: fromYear,
      year_to: toYear,
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.success && Array.isArray(body.data) ? body.data : [];
}

async function query(divisionIds: number[], start: string, end: string): Promise<Row[]> {
  const params = new URLSearchParams({ com_grp_id: "0", com_subgrp_id: "0", start_date: start, end_date: end });
  divisionIds.forEach((id) => params.append("division_id[]", String(id)));
  const body = JSON.parse(await fetchText(`${REPORT}?${params}`));
  return body.success && Array.isArray(body.data) ? body.data : [];
}

function toRecords(rows: Row[], names: Map<number, string>, base: Pick<PriceRecord, "date" | "granularity" | "division" | "market">) {
  const out: PriceRecord[] = [];
  for (const row of rows) {
    const crop = cropByDamId.get(row.commodity_id);
    if (!crop) continue;
    const sides = [
      { type: "retail" as const, unit: row.unit_retail, lo: row.avg_retail_lowestPrice, hi: row.avg_retail_howestPrice },
      { type: "wholesale" as const, unit: row.unit_whole_sale, lo: row.avg_wholesale_lowestPrice, hi: row.avg_wholesale_highestPrice },
    ];
    for (const s of sides) {
      const unit = UNIT_QTY[s.unit];
      const a = Number(s.lo);
      const b = Number(s.hi);
      if (!unit || unit.unit !== crop.unit || !(a > 0) || !(b > 0)) continue;
      const lo = Math.min(a, b) / unit.qty;
      const hi = Math.max(a, b) / unit.qty;
      // A max several times the min is a data-entry slip (e.g. 46 vs 36,519); keep neither.
      if (hi / lo > 3) continue;
      out.push({
        ...base,
        crop: crop.id,
        source: "dam",
        priceType: s.type,
        variant: names.get(row.commodity_id),
        priceMin: round(lo),
        priceMax: round(hi),
        price: round((lo + hi) / 2),
      });
    }
  }
  return out;
}

/** Drop points far from the series median (unit mix-ups such as per-quintal prices entered per kg). */
export function dropOutliers(records: PriceRecord[]): { kept: PriceRecord[]; dropped: number } {
  const groups = new Map<string, PriceRecord[]>();
  for (const r of records) {
    const k = [r.crop, r.priceType, r.variant, r.division, r.granularity].join("|");
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  const kept: PriceRecord[] = [];
  let dropped = 0;
  for (const rs of groups.values()) {
    if (rs.length < 5) {
      kept.push(...rs);
      continue;
    }
    const sorted = rs.map((r) => r.price).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    for (const r of rs) {
      if (r.price > median * 4 || r.price < median / 4) dropped++;
      else kept.push(r);
    }
  }
  return { kept, dropped };
}

export async function collectDam(opts: {
  processed: Set<string>;
  delayMs: number;
  from?: string;
}): Promise<{ records: PriceRecord[]; done: string[]; meta: SourceMeta }> {
  const dropdowns = JSON.parse(await fetchText(`${API}/common-all-dropdowns`)).data;
  const names = new Map<number, string>(dropdowns.commodityNameList.map((c: Option) => [c.value, c.text_bn.trim()]));
  const divisions: { id: number; name: string }[] = dropdowns.divisionList.map((d: Option) => ({
    id: d.value,
    name: canonicalDivision(d.text_en),
  }));

  const today = isoDay(new Date());
  const settled = (date: string) => (Date.parse(today) - Date.parse(date)) / 86_400_000 >= 4;
  const records: PriceRecord[] = [];
  const done: string[] = [];
  const allIds = divisions.map((d) => d.id);
  const from = opts.from ?? DAM_START;

  // Daily national averages.
  const todoDays = [...days(from, today)].filter((d) => !opts.processed.has(`dam:day:${d}`));
  log(`DAM: ${todoDays.length} day(s) to fetch`);
  for (const [i, date] of todoDays.entries()) {
    try {
      const rows = await query(allIds, date, date);
      records.push(...toRecords(rows, names, { date, granularity: "day", division: NATIONAL, market: "DAM national average" }));
      // Recent days are re-fetched next run because field offices keep entering prices for a few days.
      if (settled(date)) done.push(`dam:day:${date}`);
    } catch (err) {
      log(`DAM: ${date} failed: ${(err as Error).message}`);
    }
    if ((i + 1) % 25 === 0 || i === todoDays.length - 1) log(`DAM: days ${i + 1}/${todoDays.length} (${date})`);
    await sleep(opts.delayMs);
  }

  // Monthly averages per division: one request per division and commodity returns every month.
  const lastFullMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 0)).toISOString().slice(0, 7);
  const commodities = (dropdowns.commodityNameList as Commodity[]).filter((c) => cropByDamId.has(c.value));
  const markets = dropdowns.marketList as Market[];
  const todo = divisions.flatMap((div) =>
    commodities
      .map((c) => ({ div, c, key: `dam:divmonth:${div.name}:${c.value}:${lastFullMonth}` }))
      .filter((x) => !opts.processed.has(x.key)),
  );
  log(`DAM: ${todo.length} division x commodity monthly series to fetch`);
  for (const [i, { div, c, key }] of todo.entries()) {
    try {
      const marketIds = markets.filter((m) => m.division_id === div.id).map((m) => m.value);
      const rows = await queryMonthly(c, marketIds, Number(from.slice(0, 4)), new Date().getUTCFullYear());
      for (const r of rows) {
        // Only completed months: the current month's average is still moving.
        const month = r.price_date.slice(0, 7);
        if (month > lastFullMonth) continue;
        const asRow: Row = {
          commodity_id: c.value,
          unit_retail: r.unit_retail,
          unit_whole_sale: r.unit_whole_sale,
          avg_retail_lowestPrice: r.a_r_lowestPrice,
          avg_retail_howestPrice: r.a_r_howestPrice,
          avg_wholesale_lowestPrice: r.a_w_lowestPrice,
          avg_wholesale_highestPrice: r.a_w_highestPrice,
        };
        records.push(
          ...toRecords([asRow], names, { date: `${month}-01`, granularity: "month", division: div.name, market: `DAM ${div.name} markets` }),
        );
      }
      done.push(key);
    } catch (err) {
      log(`DAM: ${div.name} ${c.text_en} failed: ${(err as Error).message}`);
    }
    if ((i + 1) % 25 === 0 || i === todo.length - 1) log(`DAM: monthly ${i + 1}/${todo.length}`);
    await sleep(opts.delayMs);
  }

  log(`DAM: ${records.length} records`);
  return {
    records,
    done,
    meta: {
      id: "dam",
      name: "DAM market prices (Krishi Sheba portal)",
      url: PORTAL,
      frequency: "daily",
      coverage: "Markets in all 8 divisions: national daily and division monthly averages, retail and wholesale",
      licence: "Government of Bangladesh public information",
      fetchedAt: new Date().toISOString(),
      records: 0,
    },
  };
}
