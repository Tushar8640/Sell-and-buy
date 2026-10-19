"use client";

import type { CropAnalytics, PriceType } from "@/lib/analytics";
import { DIVISION_BN } from "@/lib/catalogue";
import type { SourceId } from "@/lib/types";
import { PRESETS, PRICE_TYPE_LABELS, SOURCE_LABELS, type FilterState } from "./filters";

const selectCls = "rounded-md border border-line bg-surface px-2 py-1.5 text-sm";

function chip(active: boolean) {
  return `rounded-full border px-3 py-1 text-sm ${
    active ? "border-accent bg-accent-soft font-medium text-accent" : "border-line text-ink-2 hover:bg-page"
  }`;
}

export function FilterBar({
  state,
  onChange,
  available,
  loading,
  error,
  observations,
}: {
  state: FilterState;
  onChange: (next: Partial<FilterState>) => void;
  available: CropAnalytics["available"];
  loading: boolean;
  error: string | null;
  observations: number;
}) {
  const firstMonth = available.first.slice(0, 7);
  const lastMonth = available.last.slice(0, 7);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="দামের ধরন" className="flex rounded-md border border-line p-0.5">
          {(["retail", "wholesale"] as PriceType[]).map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={state.priceType === t}
              disabled={!available.priceTypes.includes(t)}
              onClick={() => onChange({ priceType: t })}
              className={`rounded px-3 py-1 text-sm disabled:opacity-40 ${
                state.priceType === t ? "bg-accent text-white dark:text-black" : "text-ink-2"
              }`}
              title={!available.priceTypes.includes(t) ? "এই ফসলের এই দর পাওয়া যায় না" : undefined}
            >
              {PRICE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <select
          value={state.source}
          onChange={(e) => onChange({ source: e.target.value as SourceId | "all" })}
          className={selectCls}
          aria-label="উৎস"
        >
          {(["all", ...available.sources] as const).map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </select>
        <select value={state.division} onChange={(e) => onChange({ division: e.target.value })} className={selectCls} aria-label="বিভাগ">
          <option value="all">সব বিভাগ</option>
          {available.divisions.map((d) => (
            <option key={d} value={d}>
              {DIVISION_BN[d] ?? d}
            </option>
          ))}
        </select>
        {loading && <span className="text-sm text-muted">লোড হচ্ছে…</span>}
        {error && <span className="text-sm text-up">{error}</span>}
        <span className="ml-auto text-xs text-muted">{observations.toLocaleString("bn-BD")} পর্যবেক্ষণ</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">সময়কাল:</span>
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => onChange({ preset: p.id })} aria-pressed={state.preset === p.id} className={chip(state.preset === p.id)}>
            {p.label}
          </button>
        ))}
        <button onClick={() => onChange({ preset: "custom" })} aria-pressed={state.preset === "custom"} className={chip(state.preset === "custom")}>
          নিজে বাছুন
        </button>
        {state.preset === "custom" && (
          <span className="flex flex-wrap items-center gap-2 text-sm">
            <input
              type="month"
              value={state.fromMonth}
              min={firstMonth}
              max={lastMonth}
              onChange={(e) => onChange({ fromMonth: e.target.value })}
              className={selectCls}
              aria-label="শুরুর মাস"
            />
            <span className="text-muted">থেকে</span>
            <input
              type="month"
              value={state.toMonth}
              min={firstMonth}
              max={lastMonth}
              onChange={(e) => onChange({ toMonth: e.target.value })}
              className={selectCls}
              aria-label="শেষের মাস"
            />
          </span>
        )}
      </div>
    </div>
  );
}
