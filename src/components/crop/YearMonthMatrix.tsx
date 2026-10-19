"use client";

import type { MatrixRow } from "@/lib/analytics";
import { MONTHS_BN } from "@/lib/catalogue";
import { fmtNum, fmtTaka, seasonColour } from "@/lib/format";

/** Years x months table of average prices. Cell colour = price relative to that year's average. */
export function YearMonthMatrix({
  rows,
  selected,
  onSelect,
}: {
  rows: MatrixRow[];
  selected: { year: number | null; month: number | null };
  onSelect: (year: number | null, month: number) => void;
}) {
  if (!rows.length) return <p className="py-8 text-center text-muted">এই ফিল্টারে কোনো মাসিক তথ্য নেই।</p>;

  return (
    <div className="overflow-x-auto">
      <table className="tabular w-full min-w-[860px] border-separate border-spacing-0.5 text-xs">
        <thead>
          <tr className="text-muted">
            <th className="sticky left-0 z-10 bg-surface px-2 py-1 text-left font-medium">বছর</th>
            {MONTHS_BN.map((m, i) => (
              <th key={m} className="px-0 py-1 font-medium">
                <button
                  onClick={() => onSelect(null, i + 1)}
                  className={`w-full rounded px-1 py-0.5 hover:bg-page ${selected.month === i + 1 ? "font-semibold text-accent" : ""}`}
                >
                  {m.slice(0, 3)}
                </button>
              </th>
            ))}
            <th className="px-2 py-1 text-right font-medium">বছরের গড়</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year}>
              <th className="sticky left-0 z-10 bg-surface px-2 py-1 text-left text-sm font-medium">
                {fmtNum(row.year).replace(/,/g, "")}
              </th>
              {row.months.map((v, i) => {
                const yearText = fmtNum(row.year).replace(/,/g, "");
                const active = selected.year === row.year && selected.month === i + 1;
                const label =
                  v === null
                    ? `${MONTHS_BN[i]} ${yearText}: তথ্য নেই`
                    : `${MONTHS_BN[i]} ${yearText}: গড় ${fmtTaka(v)} (বছরের গড়ের ${fmtNum(Math.round((v / row.avg) * 100))}%)`;
                return (
                  <td key={i} className="p-0">
                    <button
                      disabled={v === null}
                      onClick={() => onSelect(row.year, i + 1)}
                      title={label}
                      aria-label={label}
                      aria-pressed={active}
                      className={`h-9 w-full rounded text-[11px] disabled:cursor-default ${active ? "ring-2 ring-ink" : ""}`}
                      style={seasonColour(v === null ? null : (v / row.avg) * 100)}
                    >
                      {v === null ? "·" : fmtNum(Math.round(v))}
                    </button>
                  </td>
                );
              })}
              <td className="px-2 py-1 text-right text-sm text-ink-2">{fmtTaka(row.avg)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
