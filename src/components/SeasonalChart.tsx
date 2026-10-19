"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeasonalMonth } from "@/lib/analytics";
import { MONTHS_BN } from "@/lib/catalogue";
import { fmtNum, fmtTaka } from "@/lib/format";

type TooltipProps = { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> };

const AXIS = { stroke: "var(--axis)", tick: { fill: "var(--muted)", fontSize: 11 }, tickLine: false } as const;

/** Bars grow up (dearer) or down (cheaper) from the 100 = yearly-average baseline. */
export function SeasonalChart({ data }: { data: SeasonalMonth[] }) {
  const rows = data.map((s) => ({ ...s, dev: s.index === null ? null : Math.round((s.index - 100) * 10) / 10 }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="month" {...AXIS} tickFormatter={(m: number) => MONTHS_BN[m - 1].slice(0, 3)} interval={0} />
          <YAxis {...AXIS} axisLine={false} width={40} tickFormatter={(v: number) => fmtNum(100 + v)} />
          <ReferenceLine y={0} stroke="var(--axis)" />
          <Tooltip content={SeasonTooltip} cursor={{ fill: "var(--grid)", opacity: 0.5 }} />
          <Bar dataKey="dev" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}>
            {rows.map((r) => (
              <Cell key={r.month} fill={(r.dev ?? 0) >= 0 ? "var(--div-high)" : "var(--div-low)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SeasonTooltip({ active, payload }: TooltipProps) {
  const s = active && (payload?.[0]?.payload as SeasonalMonth | undefined);
  if (!s) return null;
  return (
    <div className="tabular rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="mb-1 font-medium text-ink">{MONTHS_BN[s.month - 1]}</div>
      {s.index === null ? (
        <div className="text-muted">পর্যাপ্ত তথ্য নেই</div>
      ) : (
        <>
          <div className="text-ink">বছরের গড়ের {fmtNum(s.index)}%</div>
          {s.avgPrice !== null && <div className="text-ink-2">গড় দাম {fmtTaka(s.avgPrice)}</div>}
          <div className="text-muted">{fmtNum(s.years)} বছরের তথ্য</div>
        </>
      )}
    </div>
  );
}
