"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ErrorBar,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Point } from "@/lib/analytics";
import { fmtNum, fmtPeriod, fmtTaka } from "@/lib/format";

type TooltipProps = { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> };

const AXIS = { stroke: "var(--axis)", tick: { fill: "var(--muted)", fontSize: 11 }, tickLine: false } as const;

export function PriceChart({
  data,
  view,
  unit,
  compact = false,
}: {
  data: Point[];
  view: "daily" | "monthly" | "yearly";
  unit: string;
  compact?: boolean;
}) {
  const rows = data.map((p) => ({ ...p, range: [p.min, p.max] as [number, number], spread: [p.avg - p.min, p.max - p.avg] }));
  const bars = view === "yearly";

  return (
    <div className={compact ? "h-56 w-full" : "h-72 w-full sm:h-80"}>
      <ResponsiveContainer>
        <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="period" {...AXIS} tickFormatter={(v: string) => fmtPeriod(v)} minTickGap={24} />
          <YAxis {...AXIS} axisLine={false} width={48} tickFormatter={(v: number) => fmtNum(v)} domain={[0, "auto"]} />
          <Tooltip
            content={(props) => <PriceTooltip {...props} unit={unit} />}
            cursor={bars ? { fill: "var(--grid)", opacity: 0.5 } : { stroke: "var(--axis)", strokeWidth: 1 }}
          />
          {bars ? (
            <Bar dataKey="avg" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false}>
              <ErrorBar dataKey="spread" width={6} stroke="var(--ink-2)" strokeWidth={1} />
            </Bar>
          ) : (
            <>
              <Area
                dataKey="range"
                stroke="none"
                fill="var(--series-1-soft)"
                fillOpacity={0.7}
                isAnimationActive={false}
                connectNulls
                activeDot={false}
              />
              <Line
                dataKey="avg"
                stroke="var(--series-1)"
                strokeWidth={2}
                dot={rows.length <= 40 ? { r: 3, strokeWidth: 2, fill: "var(--surface)" } : false}
                activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function PriceTooltip({ active, payload, unit }: TooltipProps & { unit: string }) {
  const p = active && (payload?.[0]?.payload as Point | undefined);
  if (!p) return null;
  return (
    <div className="tabular rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="mb-1 font-medium text-ink">{fmtPeriod(p.period, true)}</div>
      <div className="flex items-center gap-2 text-ink">
        <span className="inline-block h-0.5 w-3 bg-[var(--series-1)]" />
        গড় {fmtTaka(p.avg)}/{unit}
      </div>
      <div className="text-ink-2">
        সর্বনিম্ন {fmtTaka(p.min)} · সর্বোচ্চ {fmtTaka(p.max)}
      </div>
      <div className="text-muted">{fmtNum(p.n)} পর্যবেক্ষণ</div>
    </div>
  );
}
