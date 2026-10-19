"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GROUP_LABELS, MONTHS_BN, type CropGroup } from "@/lib/catalogue";
import { fmtDate, fmtNum, fmtPct, fmtTaka, seasonColour, unitLabel } from "@/lib/format";
import type { OverviewRow } from "@/lib/prices";

type GroupFilter = CropGroup | "all";

export function OverviewBoard({ rows }: { rows: OverviewRow[] }) {
  const [group, setGroup] = useState<GroupFilter>("all");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => [...new Set(rows.map((r) => r.crop.group))], [rows]);
  const visible = rows.filter(
    (r) =>
      (group === "all" || r.crop.group === group) &&
      (!query || `${r.crop.bn} ${r.crop.en}`.toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-4">
        <h2 className="mr-auto text-base font-semibold">মাসভিত্তিক দামের ধরন</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="সবজি খুঁজুন…"
          className="w-40 rounded-md border border-line bg-page px-3 py-1.5 text-sm"
          aria-label="সবজি খুঁজুন"
        />
        {(["all", ...groups] as GroupFilter[]).map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            aria-pressed={group === g}
            className={`rounded-full border px-3 py-1 text-sm ${
              group === g ? "border-accent bg-accent-soft font-medium text-accent" : "border-line text-ink-2"
            }`}
          >
            {g === "all" ? "সব" : GROUP_LABELS[g]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="sticky left-0 z-10 bg-surface px-4 py-2 font-medium">ফসল</th>
              <th className="px-2 py-2 text-right font-medium">সর্বশেষ দর</th>
              <th className="px-2 py-2 text-right font-medium">৩০ দিনে</th>
              {MONTHS_BN.map((m) => (
                <th key={m} className="px-0.5 py-2 text-center font-medium">
                  {m.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.crop.id} className="group">
                <td className="sticky left-0 z-10 bg-surface px-4 py-1.5 group-hover:bg-page">
                  <Link href={`/crop/${r.crop.id}`} className="font-medium hover:text-accent hover:underline">
                    {r.crop.bn}
                  </Link>
                  <div className="text-xs text-muted">
                    {r.crop.en} · {fmtNum(Number(r.first.slice(0, 4))).replace(/,/g, "")} থেকে
                  </div>
                </td>
                <td className="tabular px-2 py-1.5 text-right group-hover:bg-page">
                  {r.latest ? (
                    <span title={`${fmtDate(r.latest.date)} · ${unitLabel(r.crop.unit)}`}>
                      {fmtTaka(r.latest.price)}
                      <span className="text-xs text-muted">/{r.crop.unit === "kg" ? "কেজি" : "পিস"}</span>
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="tabular px-2 py-1.5 text-right group-hover:bg-page">
                  <ChangeText pct={r.monthChange} />
                </td>
                {r.seasonal.map((idx, i) => {
                  const c = seasonColour(idx);
                  const label =
                    idx === null
                      ? `${MONTHS_BN[i]}: পর্যাপ্ত তথ্য নেই`
                      : `${r.crop.bn}, ${MONTHS_BN[i]}: বছরের গড়ের ${fmtNum(idx)}%`;
                  return (
                    <td key={i} className="p-0.5">
                      <Link
                        href={`/crop/${r.crop.id}?month=${i + 1}`}
                        title={label}
                        aria-label={label}
                        className={`tabular flex h-8 items-center justify-center rounded text-[11px] hover:outline hover:outline-2 hover:outline-ink/40 ${
                          r.peakMonth === i + 1 || r.lowMonth === i + 1 ? "font-semibold ring-2 ring-ink/60" : ""
                        }`}
                        style={c}
                      >
                        {idx === null ? "·" : fmtNum(Math.round(idx))}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line p-4 text-xs text-ink-2">
        <div className="flex items-center gap-2">
          <span>সস্তা</span>
          <div className="flex overflow-hidden rounded">
            {[70, 80, 90, 100, 110, 120, 130].map((v) => (
              <div key={v} className="tabular flex h-5 w-8 items-center justify-center text-[10px]" style={seasonColour(v)}>
                {fmtNum(v)}
              </div>
            ))}
          </div>
          <span>দামি</span>
        </div>
        <p>
          সংখ্যা = ওই মাসের গড় দাম, বছরের গড়ের শতকরা কত (১০০ = স্বাভাবিক)। ঘেরা ঘর = সবচেয়ে বেশি ও কম দামের মাস। “·” = তথ্য নেই।
        </p>
      </div>
    </section>
  );
}

export function ChangeText({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-muted">—</span>;
  const cls = pct > 0 ? "text-up" : pct < 0 ? "text-down" : "text-ink-2";
  return (
    <span className={cls}>
      {pct > 0 ? "▲" : pct < 0 ? "▼" : ""} {fmtPct(pct)}
    </span>
  );
}
