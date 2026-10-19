import type { Filters, PriceType } from "@/lib/analytics";
import type { SourceId } from "@/lib/types";

export type View = "daily" | "monthly" | "yearly";

export type Preset = "1m" | "3m" | "6m" | "1y" | "3y" | "5y" | "10y" | "all" | "custom";

export const PRESETS: { id: Exclude<Preset, "custom">; label: string; months?: number }[] = [
  { id: "1m", label: "৩০ দিন", months: 1 },
  { id: "3m", label: "৩ মাস", months: 3 },
  { id: "6m", label: "৬ মাস", months: 6 },
  { id: "1y", label: "১ বছর", months: 12 },
  { id: "3y", label: "৩ বছর", months: 36 },
  { id: "5y", label: "৫ বছর", months: 60 },
  { id: "10y", label: "১০ বছর", months: 120 },
  { id: "all", label: "সব" },
];

export const SOURCE_LABELS: Record<SourceId | "all", string> = {
  all: "সব উৎস",
  tcb: "টিসিবি (ঢাকা, দৈনিক)",
  dam: "কৃষি বিপণন অধিদপ্তর (সারা দেশ)",
  wfp: "WFP (বিভাগীয় বাজার, মাসিক)",
};

export const PRICE_TYPE_LABELS: Record<PriceType, string> = { retail: "খুচরা", wholesale: "পাইকারি" };

export interface FilterState {
  priceType: PriceType;
  source: SourceId | "all";
  division: string;
  preset: Preset;
  /** YYYY-MM, used when preset is "custom". */
  fromMonth: string;
  toMonth: string;
}

export const DEFAULT_FILTERS: FilterState = {
  priceType: "retail",
  source: "all",
  division: "all",
  preset: "all",
  fromMonth: "",
  toMonth: "",
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

function monthEnd(ym: string): string {
  const d = new Date(`${ym}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(0);
  return iso(d);
}

/** Resolve the UI state to API filters. Presets count back from the latest date with data. */
export function toFilters(state: FilterState, lastDate: string): Filters {
  let from: string | undefined;
  let to: string | undefined;
  const preset = PRESETS.find((p) => p.id === state.preset);
  if (preset?.months && lastDate) {
    const d = new Date(`${lastDate}T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() - preset.months);
    from = iso(d);
  } else if (state.preset === "custom") {
    if (state.fromMonth) from = `${state.fromMonth}-01`;
    if (state.toMonth) to = monthEnd(state.toMonth);
  }
  return { priceType: state.priceType, source: state.source, division: state.division, from, to };
}

export function toQuery(f: Filters): string {
  const q = new URLSearchParams();
  q.set("priceType", f.priceType ?? "retail");
  q.set("source", f.source ?? "all");
  q.set("division", f.division ?? "all");
  if (f.from) q.set("from", f.from);
  if (f.to) q.set("to", f.to);
  return q.toString();
}
