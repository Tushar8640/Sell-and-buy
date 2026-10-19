"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CropAnalytics } from "@/lib/analytics";
import { MONTHS_BN } from "@/lib/catalogue";
import { fmtNum, fmtTaka } from "@/lib/format";
import { PriceChart } from "../PriceChart";

type TooltipProps = { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> };

const AXIS = { stroke: "var(--axis)", tick: { fill: "var(--muted)", fontSize: 11 }, tickLine: false } as const;
const yearLabel = (y: number) => fmtNum(y).replace(/,/g, "");

/** One calendar month: its average in every year, and the daily prices inside the chosen year's month. */
export function MonthFocus({
  data,
  month,
  year,
  unit,
  onMonth,
  onYear,
}: {
  data: CropAnalytics;
  month: number;
  year: number | null;
  unit: string;
  onMonth: (m: number) => void;
  onYear: (y: number) => void;
}) {
  const byYear = [...data.matrix]
    .filter((r) => r.months[month - 1] !== null)
    .map((r) => ({ year: r.year, price: r.months[month - 1] as number, vsYear: Math.round(((r.months[month - 1] as number) / r.avg) * 100) }))
    .sort((a, b) => a.year - b.year);
  const focusYear = year && byYear.some((b) => b.year === year) ? year : (byYear.at(-1)?.year ?? null);
  const prefix = focusYear ? `${focusYear}-${String(month).padStart(2, "0")}` : "";
  const days = prefix ? data.daily.filter((p) => p.period.startsWith(prefix)) : [];
  const cheapest = byYear.reduce<(typeof byYear)[number] | null>((b, x) => (!b || x.price < b.price ? x : b), null);
  const dearest = byYear.reduce<(typeof byYear)[number] | null>((b, x) => (!b || x.price > b.price ? x : b), null);
  const avg = byYear.length ? byYear.reduce((a, b) => a + b.price, 0) / byYear.length : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1">
        {MONTHS_BN.map((m, i) => (
          <button
            key={m}
            onClick={() => onMonth(i + 1)}
            aria-pressed={month === i + 1}
            className={`rounded-md border px-2.5 py-1 text-sm ${
              month === i + 1 ? "border-accent bg-accent-soft font-medium text-accent" : "border-line text-ink-2 hover:bg-page"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {byYear.length === 0 ? (
        <p className="py-6 text-center text-muted">এই ফিল্টারে {MONTHS_BN[month - 1]} মাসের কোনো তথ্য নেই।</p>
      ) : (
        <>
          <p className="text-sm text-ink-2">
            <span className="font-medium text-ink">{MONTHS_BN[month - 1]}</span> মাসে গড় দাম{" "}
            <span className="font-medium text-ink">{avg !== null && fmtTaka(Math.round(avg * 10) / 10)}</span>/{unit} (
            {fmtNum(byYear.length)} বছরের তথ্য)।
            {cheapest && dearest && byYear.length > 1 && (
              <>
                {" "}
                সবচেয়ে কম {fmtTaka(cheapest.price)} ({yearLabel(cheapest.year)}), সবচেয়ে বেশি {fmtTaka(dearest.price)} ({yearLabel(dearest.year)})।
              </>
            )}
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="mb-1 text-sm font-medium">প্রতি বছরের {MONTHS_BN[month - 1]} (গড় দাম)</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer>
                  <BarChart data={byYear} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--grid)" />
                    <XAxis dataKey="year" {...AXIS} tickFormatter={yearLabel} />
                    <YAxis {...AXIS} axisLine={false} width={44} tickFormatter={(v: number) => fmtNum(v)} />
                    <Tooltip content={YearTooltip} cursor={{ fill: "var(--grid)", opacity: 0.5 }} />
                    <Bar
                      dataKey="price"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                      isAnimationActive={false}
                      onClick={(d) => onYear((d as unknown as { year: number }).year)}
                      className="cursor-pointer"
                    >
                      {byYear.map((b) => (
                        <Cell key={b.year} fill={b.year === focusYear ? "var(--series-1)" : "var(--series-1-soft)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted">কলামে ক্লিক করলে সেই বছরের দৈনিক দাম ডানে দেখাবে।</p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-medium">
                {MONTHS_BN[month - 1]} {focusYear && yearLabel(focusYear)}: দৈনিক দাম
              </h3>
              {days.length ? (
                <PriceChart data={days} view="daily" unit={unit} compact />
              ) : (
                <p className="py-16 text-center text-sm text-muted">এই মাসের দৈনিক তথ্য নেই, শুধু মাসিক গড় আছে।</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function YearTooltip({ active, payload }: TooltipProps) {
  const p = active && (payload?.[0]?.payload as { year: number; price: number; vsYear: number } | undefined);
  if (!p) return null;
  return (
    <div className="tabular rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="font-medium text-ink">{yearLabel(p.year)}</div>
      <div className="text-ink">গড় {fmtTaka(p.price)}</div>
      <div className="text-ink-2">ওই বছরের গড়ের {fmtNum(p.vsYear)}%</div>
    </div>
  );
}
