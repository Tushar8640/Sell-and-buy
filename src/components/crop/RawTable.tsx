"use client";

import { useEffect, useState } from "react";
import { DIVISION_BN } from "@/lib/catalogue";
import { fmtDate, fmtNum, fmtTaka } from "@/lib/format";
import type { PriceRecord } from "@/lib/types";
import { SOURCE_LABELS } from "./filters";

const PAGE = 50;
const LIMIT = 5000;

/** The exact prices as each source published them, for the current filters. */
export function RawTable({ cropId, query, unit }: { cropId: string; query: string; unit: string }) {
  const [result, setResult] = useState<{ query: string; rows?: PriceRecord[]; total?: number; failed?: boolean } | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/crops/${cropId}/records?${query}&limit=${LIMIT}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { rows: PriceRecord[]; total: number }) => {
        setResult({ query, ...d });
        setPage(0);
      })
      .catch((e: Error) => e.name !== "AbortError" && setResult({ query, failed: true }));
    return () => ctrl.abort();
  }, [cropId, query]);

  const current = result?.query === query ? result : null;
  if (!current) return <p className="py-6 text-center text-muted">লোড হচ্ছে…</p>;
  if (current.failed || !current.rows) return <p className="py-6 text-center text-up">তথ্য লোড করা যায়নি।</p>;

  const pages = Math.ceil(current.rows.length / PAGE);
  const rows = current.rows.slice(page * PAGE, (page + 1) * PAGE);

  return (
    <div>
      <p className="mb-2 text-xs text-muted">
        মোট {fmtNum(current.total!)} রেকর্ড
        {current.total! > LIMIT && ` (সর্বশেষ ${fmtNum(LIMIT)}টি দেখানো হচ্ছে; সময়কাল ছোট করুন)`}। দাম টাকা/{unit}।
        “মাসিক গড়” সারি পুরো মাসের গড়, বাকিগুলো সেই দিনের দর।
      </p>
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="tabular w-full min-w-[720px] text-sm">
          <thead className="bg-page text-left text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">তারিখ</th>
              <th className="px-3 py-2 font-medium">উৎস</th>
              <th className="px-3 py-2 font-medium">এলাকা / বাজার</th>
              <th className="px-3 py-2 font-medium">জাত / মান</th>
              <th className="px-3 py-2 text-right font-medium">সর্বনিম্ন</th>
              <th className="px-3 py-2 text-right font-medium">সর্বোচ্চ</th>
              <th className="px-3 py-2 text-right font-medium">গড়</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.date}-${r.source}-${r.market}-${r.variant}-${i}`} className="border-t border-line">
                <td className="px-3 py-1.5 whitespace-nowrap">
                  {r.granularity === "month" ? `${fmtDate(r.date).replace(/^\S+\s/, "")} (মাসিক গড়)` : fmtDate(r.date)}
                  {r.derived && <span className="ml-1 text-xs text-muted" title="পরের দিনের প্রতিবেদনের তুলনা-কলাম থেকে নেওয়া">*</span>}
                </td>
                <td className="px-3 py-1.5">{SOURCE_LABELS[r.source]}</td>
                <td className="px-3 py-1.5">
                  {DIVISION_BN[r.division] ?? r.division}
                  <span className="text-xs text-muted"> · {r.market}</span>
                </td>
                <td className="px-3 py-1.5 text-ink-2">{r.variant ?? "—"}</td>
                <td className="px-3 py-1.5 text-right">{r.priceMin !== undefined ? fmtTaka(r.priceMin) : "—"}</td>
                <td className="px-3 py-1.5 text-right">{r.priceMax !== undefined ? fmtTaka(r.priceMax) : "—"}</td>
                <td className="px-3 py-1.5 text-right font-medium">{fmtTaka(r.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-2 flex items-center justify-end gap-2 text-sm">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded border border-line px-2 py-1 disabled:opacity-40">
            আগের
          </button>
          <span className="text-muted">
            {fmtNum(page + 1)} / {fmtNum(pages)}
          </span>
          <button
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-line px-2 py-1 disabled:opacity-40"
          >
            পরের
          </button>
        </div>
      )}
    </div>
  );
}
