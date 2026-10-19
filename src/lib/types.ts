// Shape of data/prices.json. Kept flat so it maps 1:1 onto a database table later.

export type SourceId = "tcb" | "dam" | "wfp";

export interface PriceRecord {
  crop: string;
  /** ISO date, YYYY-MM-DD. Monthly records are dated the first (DAM) or 15th (WFP) of the month. */
  date: string;
  /** "day" = one day's price; "month" = an average over the month. */
  granularity: "day" | "month";
  source: SourceId;
  /** Canonical division name (see catalogue DIVISIONS), or NATIONAL for a country-wide average. */
  division: string;
  market: string;
  /** Source's own product name when one crop has several grades, e.g. "Brinjal - Superior Quality". */
  variant?: string;
  priceType: "retail" | "wholesale";
  /** BDT per crop unit (see catalogue). */
  price: number;
  priceMin?: number;
  priceMax?: number;
  /** True when taken from a report's "week/month/year ago" column rather than that day's own report. */
  derived?: boolean;
}

export interface SourceMeta {
  id: SourceId;
  name: string;
  url: string;
  frequency: "daily" | "monthly";
  coverage: string;
  licence: string;
  fetchedAt: string;
  records: number;
}

export interface Dataset {
  generatedAt: string;
  sources: SourceMeta[];
  /** Work already done (TCB file URLs, "dam:day:YYYY-MM-DD", "dam:month:YYYY-MM:<division>"), so re-runs skip it. */
  processedFiles: string[];
  records: PriceRecord[];
}
