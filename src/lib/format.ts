import { MONTHS_BN } from "./catalogue";

const num = new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const monthYear = new Intl.DateTimeFormat("bn-BD", { month: "short", year: "numeric", timeZone: "UTC" });
const dayMonth = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", year: "2-digit", timeZone: "UTC" });

export const fmtNum = (n: number) => num.format(n);
export const fmtTaka = (n: number) => `৳${num.format(n)}`;
export const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${num.format(n)}%`;
export const fmtDate = (iso: string) => date.format(new Date(iso));
export const unitLabel = (unit: "kg" | "piece") => (unit === "kg" ? "প্রতি কেজি" : "প্রতি পিস");
export const monthName = (m: number | null) => (m ? MONTHS_BN[m - 1] : "—");

/** Axis/tooltip label for a series period: YYYY-MM-DD, YYYY-MM or YYYY. */
export function fmtPeriod(period: string, long = false): string {
  if (period.length === 4) return num.format(Number(period)).replace(/[,٬]/g, "");
  if (period.length === 7) return monthYear.format(new Date(`${period}-01`));
  return long ? date.format(new Date(period)) : dayMonth.format(new Date(period));
}

/** Diverging colour for a seasonal index (100 = average). ±30% saturates. */
export function seasonColour(index: number | null): { background: string; color: string } {
  if (index === null) return { background: "transparent", color: "var(--muted)" };
  const t = Math.max(-1, Math.min(1, (index - 100) / 30));
  const pole = t >= 0 ? "var(--div-high)" : "var(--div-low)";
  const pct = Math.round(Math.abs(t) * 100);
  return {
    background: `color-mix(in oklab, ${pole} ${pct}%, var(--div-mid))`,
    color: pct > 55 ? "#ffffff" : "var(--ink)",
  };
}
