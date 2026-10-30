"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GROUP_LABELS, MONTHS_BN, type CropGroup } from "@/lib/catalogue";
import { fmtDate, fmtNum, fmtPct, fmtTaka, monthName, seasonColour, unitLabel } from "@/lib/format";
import { getCropImage } from "@/lib/cropImages";
import type { OverviewRow } from "@/lib/prices";
import { CropImage } from "./CropImage";

type GroupFilter = CropGroup | "all";
type SortOption = "default" | "price-asc" | "price-desc" | "change-desc" | "change-asc" | "name-asc";
type TableUnit = "amount" | "percent";

const PAGE_SIZES = [12, 24, 48];

export function OverviewBoard({ rows }: { rows: OverviewRow[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [tableUnit, setTableUnit] = useState<TableUnit>("amount");
  const [group, setGroup] = useState<GroupFilter>("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const groups = useMemo(() => {
    const list = [...new Set(rows.map((r) => r.crop.group))];
    return list;
  }, [rows]);

  // Group counts for badges
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { all: rows.length };
    for (const r of rows) {
      counts[r.crop.group] = (counts[r.crop.group] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  // Filter & Sort
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = rows.filter((r) => {
      const matchGroup = group === "all" || r.crop.group === group;
      if (!matchGroup) return false;
      if (!q) return true;
      const haystack = `${r.crop.bn} ${r.crop.en} ${GROUP_LABELS[r.crop.group]}`.toLowerCase();
      return haystack.includes(q);
    });

    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.latest?.price ?? Infinity) - (b.latest?.price ?? Infinity));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.latest?.price ?? -Infinity) - (a.latest?.price ?? -Infinity));
    } else if (sortBy === "change-desc") {
      result.sort((a, b) => (b.monthChangeAmount ?? b.monthChange ?? -Infinity) - (a.monthChangeAmount ?? a.monthChange ?? -Infinity));
    } else if (sortBy === "change-asc") {
      result.sort((a, b) => (a.monthChangeAmount ?? a.monthChange ?? Infinity) - (b.monthChangeAmount ?? b.monthChange ?? Infinity));
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.crop.bn.localeCompare(b.crop.bn, "bn"));
    }

    return result;
  }, [rows, group, query, sortBy]);

  // Reset page when filter changes
  const handleGroupChange = (g: GroupFilter) => {
    setGroup(g);
    setCurrentPage(1);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const currentSafePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentSafePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentSafePage, pageSize]);

  return (
    <section className="rounded-2xl border border-line bg-surface shadow-xs transition-shadow">
      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-4 border-b border-line p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">সবজির বাজার দর ও মৌসুমি ধরন</h2>
            <p className="text-xs text-ink-2">
              দৈনিক দাম, ৩০ দিনের ওঠানামা এবং বছরের মাসভিত্তিক মূল্য প্রবণতা
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Amount vs Percentage Toggle (Shown for Table View or available generally) */}
            {viewMode === "table" && (
              <div className="flex items-center rounded-lg border border-line bg-page p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTableUnit("amount")}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    tableUnit === "amount"
                      ? "bg-surface font-semibold text-accent shadow-xs"
                      : "text-ink-2 hover:text-ink"
                  }`}
                  aria-pressed={tableUnit === "amount"}
                >
                  <span>টাকার পরিমাণ (৳)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTableUnit("percent")}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    tableUnit === "percent"
                      ? "bg-surface font-semibold text-accent shadow-xs"
                      : "text-ink-2 hover:text-ink"
                  }`}
                  aria-pressed={tableUnit === "percent"}
                >
                  <span>শতকরা হার (%)</span>
                </button>
              </div>
            )}

            {/* Grid vs Table View Switcher */}
            <div className="flex items-center rounded-lg border border-line bg-page p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-surface font-semibold text-accent shadow-xs"
                    : "text-ink-2 hover:text-ink"
                }`}
                aria-label="গ্রিড ভিউ"
                aria-pressed={viewMode === "grid"}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
                <span>গ্রিড</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-surface font-semibold text-accent shadow-xs"
                    : "text-ink-2 hover:text-ink"
                }`}
                aria-label="তালিকা ভিউ"
                aria-pressed={viewMode === "table"}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
                </svg>
                <span>তালিকা</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search, Filter Pills & Sort Row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="সবজির নাম খুঁজুন (যেমন: আলু, বেগুন, পেঁয়াজ)..."
              className="w-full rounded-xl border border-line bg-page py-2 pl-9 pr-9 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              aria-label="সবজি খুঁজুন"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                title="অনুসন্ধান মুছুন"
              >
                ✕
              </button>
            )}
          </div>

          {/* Group Category Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", ...groups] as GroupFilter[]).map((g) => {
              const active = group === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGroupChange(g)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-page/60 text-ink-2 hover:border-accent/40 hover:text-ink"
                  }`}
                >
                  <span>{g === "all" ? "সব ফসল" : GROUP_LABELS[g]}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      active ? "bg-accent text-white" : "bg-line/70 text-ink-2"
                    }`}
                  >
                    {fmtNum(groupCounts[g] ?? 0)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <span className="text-xs text-muted whitespace-nowrap">ক্রম:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-line bg-page px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
              aria-label="ক্রম সাজান"
            >
              <option value="default">প্রস্তাবিত ক্রম</option>
              <option value="price-asc">দাম: কম থেকে বেশি</option>
              <option value="price-desc">দাম: বেশি থেকে কম</option>
              <option value="change-desc">৩০ দিনে দর বৃদ্ধি</option>
              <option value="change-asc">৩০ দিনে দর হ্রাস</option>
              <option value="name-asc">নাম অনুসারে (অ-ক্ষর)</option>
            </select>
          </div>
        </div>

        {/* Results Counter summary */}
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {filteredRows.length === rows.length
              ? `মোট ${fmtNum(rows.length)}টি ফসল উপলব্ধ`
              : `${fmtNum(rows.length)}টির মধ্যে ${fmtNum(filteredRows.length)}টি ফসল পাওয়া গেছে`}
          </span>
          {viewMode === "grid" && filteredRows.length > 0 && (
            <span>
              পৃষ্ঠা {fmtNum(currentSafePage)} এর {fmtNum(totalPages)}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-ink">কোনো ফসল পাওয়া যায়নি</h3>
          <p className="mt-1 text-sm text-ink-2 max-w-sm">
            &ldquo;{query}&rdquo; এর সাথে মেলে এমন কোনো সবজি বা ফসল পাওয়া যায়নি। অন্য কোনো নাম চেষ্টা করুন।
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGroup("all");
            }}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW WITH IMAGES */
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {paginatedRows.map((r, idx) => {
              const imgUrl = getCropImage(r.crop.id);
              const lowMonthPrice = r.lowMonth && r.seasonalPrices ? r.seasonalPrices[r.lowMonth - 1] : null;
              const peakMonthPrice = r.peakMonth && r.seasonalPrices ? r.seasonalPrices[r.peakMonth - 1] : null;

              return (
                <div
                  key={r.crop.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
                >
                  {/* Crop Image Banner */}
                  <Link href={`/crop/${r.crop.id}`} className="relative block aspect-[16/10] overflow-hidden bg-page">
                    <CropImage
                      src={imgUrl}
                      alt={r.crop.bn}
                      priority={currentPage === 1 && idx < 4}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Category Pill Tag */}
                    <span className="absolute left-2.5 top-2.5 rounded-full border border-black/10 bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-800 backdrop-blur-xs shadow-2xs dark:bg-black/80 dark:text-white">
                      {GROUP_LABELS[r.crop.group]}
                    </span>
                    {/* Unit Pill Tag */}
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                      {r.crop.unit === "kg" ? "কেজি" : "পিস"}
                    </span>
                  </Link>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-4">
                    {/* Title & English Subtitle */}
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        href={`/crop/${r.crop.id}`}
                        className="font-bold text-base text-ink group-hover:text-accent transition-colors"
                      >
                        {r.crop.bn}
                      </Link>
                      <span className="text-xs text-muted truncate">{r.crop.en}</span>
                    </div>

                    {/* Price and 30-day Change Amount */}
                    <div className="mt-3 flex items-baseline justify-between rounded-lg bg-page/80 p-2.5">
                      <div>
                        <div className="text-[11px] text-muted">সর্বশেষ দর</div>
                        {r.latest ? (
                          <div className="text-lg font-bold text-ink tracking-tight">
                            {fmtTaka(r.latest.price)}
                            <span className="text-xs font-normal text-muted">
                              /{r.crop.unit === "kg" ? "কেজি" : "পিস"}
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-muted">—</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-muted">৩০ দিনে</div>
                        <ChangeAmountBadge amount={r.monthChangeAmount} pct={r.monthChange} />
                      </div>
                    </div>

                    {/* Peak & Low Season Quick Info with Amount */}
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-ink-2">
                        <span className="text-muted flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                          সবচেয়ে সস্তা:
                        </span>
                        <span className="font-medium text-ink">
                          {r.lowMonth ? monthName(r.lowMonth) : "—"}
                          {lowMonthPrice !== null && (
                            <span className="ml-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                              ({fmtTaka(Math.round(lowMonthPrice))})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-ink-2">
                        <span className="text-muted flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                          সর্বোচ্চ দাম:
                        </span>
                        <span className="font-medium text-ink">
                          {r.peakMonth ? monthName(r.peakMonth) : "—"}
                          {peakMonthPrice !== null && (
                            <span className="ml-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                              ({fmtTaka(Math.round(peakMonthPrice))})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Mini Seasonal Heatmap Preview */}
                    <div className="mt-3 pt-2 border-t border-line/60">
                      <div className="mb-1 text-[10px] text-muted flex items-center justify-between">
                        <span>মৌসুমি দর (১২ মাস)</span>
                        <span className="text-[9px]">জা-ডি</span>
                      </div>
                      <div className="grid grid-cols-12 gap-0.5">
                        {r.seasonal.map((idx, i) => {
                          const col = seasonColour(idx);
                          const mPrice = r.seasonalPrices ? r.seasonalPrices[i] : null;
                          return (
                            <Link
                              key={i}
                              href={`/crop/${r.crop.id}?month=${i + 1}`}
                              title={`${MONTHS_BN[i]}: ${mPrice !== null ? fmtTaka(Math.round(mPrice)) : "তথ্য নেই"}${idx ? ` (${fmtNum(Math.round(idx))}%)` : ""}`}
                              className="h-3.5 rounded-xs transition-transform hover:scale-125 hover:z-10"
                              style={col}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="mt-4 pt-2">
                      <Link
                        href={`/crop/${r.crop.id}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-page py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
                      >
                        <span>বিস্তারিত দেখুন</span>
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
              <div className="flex items-center gap-2 text-xs text-ink-2">
                <span>প্রতি পৃষ্ঠায়:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-line bg-page px-2 py-1 text-xs text-ink"
                >
                  {PAGE_SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {fmtNum(sz)}টি
                    </option>
                  ))}
                </select>
                <span className="text-muted">
                  ({fmtNum((currentSafePage - 1) * pageSize + 1)} -{" "}
                  {fmtNum(Math.min(currentSafePage * pageSize, filteredRows.length))} এর মোট{" "}
                  {fmtNum(filteredRows.length)})
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={currentSafePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors disabled:pointer-events-none disabled:opacity-40 hover:bg-page"
                  aria-label="পূর্ববর্তী পৃষ্ঠা"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  <span>আগের</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                    const isCurrent = pg === currentSafePage;
                    return (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={`h-7 w-7 rounded-lg text-xs font-semibold transition-all ${
                          isCurrent
                            ? "bg-accent text-white shadow-xs"
                            : "border border-line bg-surface text-ink hover:bg-page"
                        }`}
                        aria-current={isCurrent ? "page" : undefined}
                      >
                        {fmtNum(pg)}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentSafePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors disabled:pointer-events-none disabled:opacity-40 hover:bg-page"
                  aria-label="পরবর্তী পৃষ্ঠা"
                >
                  <span>পরের</span>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TABLE / LIST VIEW - WITH AMOUNT (টাকার পরিমাণ) */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-line bg-page/50">
                <th className="sticky left-0 z-10 bg-surface px-4 py-3 font-semibold">ফসল</th>
                <th className="px-3 py-3 text-right font-semibold">সর্বশেষ দর</th>
                <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                  {tableUnit === "amount" ? "৩০ দিনে পরিবর্তন (টাকা)" : "৩০ দিনে পরিবর্তন (%)"}
                </th>
                {MONTHS_BN.map((m) => (
                  <th key={m} className="px-1 py-3 text-center font-semibold text-xs min-w-[58px]">
                    <div>{m.slice(0, 3)}</div>
                    {tableUnit === "amount" && <div className="text-[10px] font-normal text-muted/80">(টাকা)</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, rowIdx) => {
                const img = getCropImage(r.crop.id);
                return (
                  <tr
                    key={r.crop.id}
                    className={`group transition-colors ${
                      rowIdx % 2 === 0 ? "bg-surface" : "bg-page/30"
                    } hover:bg-accent-soft/20`}
                  >
                    <td className="sticky left-0 z-10 bg-surface group-hover:bg-accent-soft/20 px-4 py-2 border-b border-line/50">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line">
                          <CropImage
                            src={img}
                            alt={r.crop.bn}
                            sizes="36px"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/crop/${r.crop.id}`}
                            className="font-bold text-ink hover:text-accent hover:underline"
                          >
                            {r.crop.bn}
                          </Link>
                          <div className="text-xs text-muted">
                            {r.crop.en} · {GROUP_LABELS[r.crop.group]}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="tabular px-3 py-2 text-right border-b border-line/50">
                      {r.latest ? (
                        <span title={`${fmtDate(r.latest.date)} · ${unitLabel(r.crop.unit)}`}>
                          <span className="font-bold text-ink">{fmtTaka(r.latest.price)}</span>
                          <span className="text-xs text-muted">
                            /{r.crop.unit === "kg" ? "কেজি" : "পিস"}
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="tabular px-3 py-2 text-right border-b border-line/50">
                      {tableUnit === "amount" ? (
                        <ChangeAmountBadge amount={r.monthChangeAmount} pct={r.monthChange} />
                      ) : (
                        <ChangeBadge pct={r.monthChange} />
                      )}
                    </td>
                    {r.seasonal.map((idx, i) => {
                      const c = seasonColour(idx);
                      const isPeak = r.peakMonth === i + 1;
                      const isLow = r.lowMonth === i + 1;
                      const mPrice = r.seasonalPrices ? r.seasonalPrices[i] : null;

                      const label =
                        tableUnit === "amount"
                          ? `${r.crop.bn}, ${MONTHS_BN[i]}: গড় দর ${mPrice !== null ? fmtTaka(mPrice) : "তথ্য নেই"}/${unitLabel(r.crop.unit)}${isPeak ? " (সর্বোচ্চ দাম)" : isLow ? " (সর্বনিম্ন দাম)" : ""}`
                          : `${r.crop.bn}, ${MONTHS_BN[i]}: গড়ের ${fmtNum(idx ?? 0)}%${isPeak ? " (সর্বোচ্চ দাম)" : isLow ? " (সর্বনিম্ন দাম)" : ""}`;

                      return (
                        <td key={i} className="p-0.5 border-b border-line/50">
                          <Link
                            href={`/crop/${r.crop.id}?month=${i + 1}`}
                            title={label}
                            aria-label={label}
                            className={`tabular flex h-8 items-center justify-center rounded px-1 text-[11px] font-semibold transition-transform hover:scale-105 hover:shadow-xs ${
                              isPeak || isLow ? "ring-2 ring-ink/70" : ""
                            }`}
                            style={c}
                          >
                            {tableUnit === "amount" ? (
                              mPrice === null ? (
                                "—"
                              ) : (
                                <span>{fmtTaka(Math.round(mPrice))}</span>
                              )
                            ) : idx === null ? (
                              "·"
                            ) : (
                              fmtNum(Math.round(idx))
                            )}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend & Guide Footer */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line p-4 text-xs text-ink-2 bg-page/40">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">মৌসুম নির্দেশিকা:</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">সস্তা (মৌসুম)</span>
          <div className="flex overflow-hidden rounded-md border border-line shadow-2xs">
            {[70, 80, 90, 100, 110, 120, 130].map((v) => (
              <div
                key={v}
                className="tabular flex h-5 w-7 items-center justify-center text-[10px] font-medium"
                style={seasonColour(v)}
              >
                {fmtNum(v)}
              </div>
            ))}
          </div>
          <span className="text-red-600 dark:text-red-400 font-medium">দামি (অ-মৌসুম)</span>
        </div>
        <p className="text-[11px] text-muted">
          {tableUnit === "amount"
            ? "প্রতিটি ঘরে প্রদর্শিত মান হলো ওই মাসের ঐতিহাসিক গড় খুচরা দর (টাকায়)। ঘেরা ঘর = সবচেয়ে বেশি ও কম দামের মাস।"
            : "১০০ = বাৎসরিক গড় দাম। ১০০ এর নিচে মানে বাজারে সরবরাহ বেশি ও দাম সস্তা। ১০০ এর বেশি মানে সরবরাহ কম ও দাম চড়া।"}
        </p>
      </div>
    </section>
  );
}

export function ChangeAmountBadge({
  amount,
  pct,
}: {
  amount: number | null;
  pct: number | null;
}) {
  if (amount === null && pct === null) return <span className="text-muted text-xs">—</span>;
  const val = amount ?? pct ?? 0;
  if (val === 0) {
    return <span className="rounded-md bg-page px-1.5 py-0.5 text-xs text-ink-2 font-medium">৳০.০</span>;
  }
  const isUp = val > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular ${
        isUp ? "bg-red-500/10 text-up" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      }`}
      title={pct !== null ? `৩০ দিনে ${isUp ? "+" : ""}${fmtPct(pct)}` : undefined}
    >
      <span>{isUp ? "▲" : "▼"}</span>
      <span>
        {amount !== null
          ? `${isUp ? "+" : ""}${fmtTaka(Math.abs(amount))}`
          : `${isUp ? "+" : ""}${fmtPct(Math.abs(pct!))}`}
      </span>
    </span>
  );
}

export function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-muted text-xs">—</span>;
  if (pct === 0) {
    return <span className="rounded-md bg-page px-1.5 py-0.5 text-xs text-ink-2">০%</span>;
  }
  const isUp = pct > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular ${
        isUp ? "bg-red-500/10 text-up" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      }`}
    >
      <span>{isUp ? "▲" : "▼"}</span>
      <span>{fmtPct(Math.abs(pct))}</span>
    </span>
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
