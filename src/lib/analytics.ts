// Pure aggregation over price records. No I/O here, so it works the same over JSON or a database.

import type { PriceRecord, SourceId } from "./types";

export type PriceType = PriceRecord["priceType"];

export interface Point {
  /** YYYY-MM-DD (daily), YYYY-MM (monthly) or YYYY (yearly). */
  period: string;
  avg: number;
  min: number;
  max: number;
  /** Number of observations behind the point. */
  n: number;
}

export interface SeasonalMonth {
  /** 1-12 */
  month: number;
  /** Average price in this calendar month as % of that year's average (100 = normal). Null when too little data. */
  index: number | null;
  /** Plain average price for this calendar month across all years. */
  avgPrice: number | null;
  years: number;
}

export interface MatrixRow {
  year: number;
  /** Average price per calendar month, index 0 = January; null where there is no data. */
  months: (number | null)[];
  avg: number;
}

export interface Change {
  pct: number;
  from: number;
  fromDate: string;
}

export interface Extreme {
  price: number;
  period: string;
}

export interface CropAnalytics {
  daily: Point[];
  monthly: Point[];
  yearly: (Point & { months: number })[];
  seasonal: SeasonalMonth[];
  matrix: MatrixRow[];
  /** Summary of the selected range. */
  range: { from: string; to: string; avg: number; low: Extreme; high: Extreme } | null;
  latest: { date: string; price: number } | null;
  change: { week: Change | null; month: Change | null; year: Change | null };
  peakMonth: number | null;
  lowMonth: number | null;
  /** What the unfiltered data offers, for building the filter controls. */
  available: { divisions: string[]; sources: SourceId[]; priceTypes: PriceType[]; first: string; last: string };
  /** Source behind the daily series (one source only; see analyseCrop). */
  dailySources: SourceId[];
  observations: number;
}

export interface Filters {
  source?: SourceId | "all";
  division?: string | "all";
  priceType?: PriceType;
  /** Inclusive ISO dates. */
  from?: string;
  to?: string;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const r2 = (n: number) => Math.round(n * 100) / 100;

function group<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = out.get(k);
    if (bucket) bucket.push(item);
    else out.set(k, [item]);
  }
  return out;
}

const sortedEntries = <T>(m: Map<string, T>) => [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
const lo = (r: PriceRecord) => r.priceMin ?? r.price;
const hi = (r: PriceRecord) => r.priceMax ?? r.price;

export function applyFilters(records: PriceRecord[], f: Filters): PriceRecord[] {
  return records.filter(
    (r) =>
      (!f.source || f.source === "all" || r.source === f.source) &&
      (!f.division || f.division === "all" || r.division === f.division) &&
      r.priceType === (f.priceType ?? "retail") &&
      (!f.from || r.date >= f.from) &&
      (!f.to || r.date <= f.to),
  );
}

/**
 * One point per period. Within a period each source is averaged first (over its markets and grades),
 * then the sources are averaged, so a source with many rows doesn't outweigh one with few.
 */
function series(records: PriceRecord[], periodOf: (r: PriceRecord) => string): Point[] {
  return sortedEntries(group(records, periodOf)).map(([period, rows]) => {
    const perSource = [...group(rows, (r) => r.source).values()].map((rs) => mean(rs.map((r) => r.price)));
    return {
      period,
      avg: r2(mean(perSource)),
      min: r2(Math.min(...rows.map(lo))),
      max: r2(Math.max(...rows.map(hi))),
      n: rows.length,
    };
  });
}

/** Monthly series. A source's daily rows are used where it has them; its monthly averages fill the rest. */
function monthlySeries(records: PriceRecord[]): Point[] {
  const dailyMonths = new Set(records.filter((r) => r.granularity === "day").map((r) => `${r.source}|${r.date.slice(0, 7)}`));
  const usable = records.filter((r) => r.granularity === "day" || !dailyMonths.has(`${r.source}|${r.date.slice(0, 7)}`));
  return series(usable, (r) => r.date.slice(0, 7));
}

function seasonality(monthly: Point[]): SeasonalMonth[] {
  const byYear = group(monthly, (p) => p.period.slice(0, 4));
  const indices = new Map<number, number[]>();
  const prices = new Map<number, number[]>();
  for (const points of byYear.values()) {
    for (const p of points) {
      const m = Number(p.period.slice(5, 7));
      prices.set(m, [...(prices.get(m) ?? []), p.avg]);
    }
    // A year needs enough months for its average to be a fair baseline.
    if (points.length < 4) continue;
    const yearAvg = mean(points.map((p) => p.avg));
    for (const p of points) {
      const m = Number(p.period.slice(5, 7));
      indices.set(m, [...(indices.get(m) ?? []), (p.avg / yearAvg) * 100]);
    }
  }
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const idx = indices.get(m);
    const pr = prices.get(m);
    return {
      month: m,
      index: idx ? Math.round(mean(idx) * 10) / 10 : null,
      avgPrice: pr ? r2(mean(pr)) : null,
      years: idx?.length ?? 0,
    };
  });
}

function matrixOf(monthly: Point[]): MatrixRow[] {
  return sortedEntries(group(monthly, (p) => p.period.slice(0, 4)))
    .map(([year, points]) => {
      const months: (number | null)[] = Array(12).fill(null);
      for (const p of points) months[Number(p.period.slice(5, 7)) - 1] = p.avg;
      return { year: Number(year), months, avg: r2(mean(points.map((p) => p.avg))) };
    })
    .reverse();
}

function changeSince(daily: Point[], days: number): Change | null {
  const last = daily.at(-1);
  if (!last) return null;
  const target = Date.parse(last.period) - days * 86_400_000;
  const tolerance = Math.max(3, days * 0.1) * 86_400_000;
  let best: Point | null = null;
  for (const p of daily) {
    const t = Date.parse(p.period);
    if (Math.abs(t - target) <= tolerance && (!best || Math.abs(t - target) < Math.abs(Date.parse(best.period) - target))) {
      best = p;
    }
  }
  if (!best || best === last) return null;
  return { pct: Math.round(((last.avg - best.avg) / best.avg) * 1000) / 10, from: best.avg, fromDate: best.period };
}

export function analyseCrop(all: PriceRecord[], filters: Filters = {}): CropAnalytics {
  const records = applyFilters(all, filters);
  // Sources price different markets (TCB = Dhaka, DAM = national), so averaging them day by day makes
  // the line jump whenever one skips a day. The daily series uses the source with the most daily rows.
  const dailyRows = records.filter((r) => r.granularity === "day");
  const dailyCounts = [...group(dailyRows, (r) => r.source).entries()].sort((a, b) => b[1].length - a[1].length);
  const dailySource = dailyCounts[0]?.[0];
  const daily = series(
    dailyRows.filter((r) => r.source === dailySource),
    (r) => r.date,
  );
  const monthly = monthlySeries(records);
  const yearly = sortedEntries(group(monthly, (p) => p.period.slice(0, 4))).map(([year, months]) => ({
    period: year,
    avg: r2(mean(months.map((m) => m.avg))),
    min: r2(Math.min(...months.map((m) => m.min))),
    max: r2(Math.max(...months.map((m) => m.max))),
    n: months.reduce((a, m) => a + m.n, 0),
    months: months.length,
  }));
  const seasonal = seasonality(monthly);
  const ranked = seasonal.filter((s) => s.index !== null).sort((a, b) => b.index! - a.index!);

  // Range summary prefers daily detail; falls back to monthly averages.
  const detail = daily.length ? daily : monthly;
  const range = detail.length
    ? {
        from: records.reduce((m, r) => (r.date < m ? r.date : m), records[0].date),
        to: records.reduce((m, r) => (r.date > m ? r.date : m), records[0].date),
        avg: r2(mean(detail.map((p) => p.avg))),
        low: detail.reduce((b, p) => (p.avg < b.price ? { price: p.avg, period: p.period } : b), { price: Infinity, period: "" }),
        high: detail.reduce((b, p) => (p.avg > b.price ? { price: p.avg, period: p.period } : b), { price: -Infinity, period: "" }),
      }
    : null;
  const latestPoint = daily.at(-1) ?? monthly.at(-1);
  const dates = all.map((r) => r.date).sort();

  return {
    daily,
    monthly,
    yearly,
    seasonal,
    matrix: matrixOf(monthly),
    range,
    latest: latestPoint ? { date: latestPoint.period, price: latestPoint.avg } : null,
    change: { week: changeSince(daily, 7), month: changeSince(daily, 30), year: changeSince(daily, 365) },
    peakMonth: ranked.length >= 6 ? ranked[0].month : null,
    lowMonth: ranked.length >= 6 ? ranked.at(-1)!.month : null,
    available: {
      divisions: [...new Set(all.map((r) => r.division))].sort(),
      sources: [...new Set(all.map((r) => r.source))].sort() as SourceId[],
      priceTypes: [...new Set(all.map((r) => r.priceType))].sort() as PriceType[],
      first: dates[0] ?? "",
      last: dates.at(-1) ?? "",
    },
    dailySources: dailySource ? [dailySource as SourceId] : [],
    observations: records.length,
  };
}

/** Raw observations for the table view, newest first. */
export function rawRecords(all: PriceRecord[], filters: Filters, limit = 5000): { rows: PriceRecord[]; total: number } {
  const rows = applyFilters(all, filters).sort(
    (a, b) => b.date.localeCompare(a.date) || a.source.localeCompare(b.source) || a.division.localeCompare(b.division),
  );
  return { rows: rows.slice(0, limit), total: rows.length };
}
