"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MatrixRow } from "@/lib/analytics";
import { MONTHS_BN } from "@/lib/catalogue";
import { fmtNum, fmtTaka } from "@/lib/format";

type TooltipProps = { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> };

const AXIS = { stroke: "var(--axis)", tick: { fill: "var(--muted)", fontSize: 11 }, tickLine: false } as const;
const yearLabel = (y: number) => fmtNum(y).replace(/,/g, "");

/** One line per year over Jan-Dec. The selected year is drawn in colour, the rest recede in grey. */
export function YearCompareChart({
  rows,
  selectedYear,
  onSelectYear,
}: {
  rows: MatrixRow[];
  selectedYear: number | null;
  onSelectYear: (year: number) => void;
}) {
  const years = [...rows].sort((a, b) => a.year - b.year);
  const focus = selectedYear ?? years.at(-1)?.year ?? null;
  const data = MONTHS_BN.map((_, i) => {
    const point: Record<string, number | null> = { month: i + 1 };
    for (const y of years) point[`y${y.year}`] = y.months[i];
    return point;
  });

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted">বছর বাছুন:</span>
        {years.map((y) => (
          <button
            key={y.year}
            onClick={() => onSelectYear(y.year)}
            aria-pressed={focus === y.year}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${
              focus === y.year ? "border-[var(--series-1)] font-medium text-ink" : "border-line text-ink-2"
            }`}
          >
            <span className="inline-block h-0.5 w-3" style={{ background: focus === y.year ? "var(--series-1)" : "var(--axis)" }} />
            {yearLabel(y.year)}
          </button>
        ))}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis dataKey="month" {...AXIS} interval={0} tickFormatter={(m: number) => MONTHS_BN[m - 1].slice(0, 3)} />
            <YAxis {...AXIS} axisLine={false} width={48} tickFormatter={(v: number) => fmtNum(v)} domain={[0, "auto"]} />
            <Tooltip content={(p) => <CompareTooltip {...p} years={years.map((y) => y.year)} focus={focus} />} cursor={{ stroke: "var(--axis)" }} />
            {years
              .filter((y) => y.year !== focus)
              .map((y) => (
                <Line
                  key={y.year}
                  dataKey={`y${y.year}`}
                  stroke="var(--axis)"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            {focus !== null && (
              <Line
                dataKey={`y${focus}`}
                stroke="var(--series-1)"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: "var(--surface)" }}
                activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }}
                connectNulls
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CompareTooltip({ active, payload, years, focus }: TooltipProps & { years: number[]; focus: number | null }) {
  const p = active && (payload?.[0]?.payload as Record<string, number | null> | undefined);
  if (!p) return null;
  return (
    <div className="tabular rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="mb-1 font-medium text-ink">{MONTHS_BN[(p.month as number) - 1]}</div>
      {[...years].reverse().map((y) => {
        const v = p[`y${y}`];
        return (
          <div key={y} className={`flex justify-between gap-4 ${y === focus ? "font-medium text-ink" : "text-ink-2"}`}>
            <span>{yearLabel(y)}</span>
            <span>{v == null ? "—" : fmtTaka(v)}</span>
          </div>
        );
      })}
    </div>
  );
}
