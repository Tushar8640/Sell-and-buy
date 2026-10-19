"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CropAnalytics, Point } from "@/lib/analytics";
import type { Crop } from "@/lib/catalogue";
import { fmtDate, fmtNum, fmtPeriod, fmtTaka, monthName, unitLabel } from "@/lib/format";
import { ChangeText } from "../OverviewBoard";
import { PriceChart } from "../PriceChart";
import { SeasonalChart } from "../SeasonalChart";
import { StatTile } from "../StatTile";
import { FilterBar } from "./FilterBar";
import { DEFAULT_FILTERS, PRICE_TYPE_LABELS, SOURCE_LABELS, toFilters, toQuery, type FilterState, type View } from "./filters";
import { MonthFocus } from "./MonthFocus";
import { RawTable } from "./RawTable";
import { YearCompareChart } from "./YearCompareChart";
import { YearMonthMatrix } from "./YearMonthMatrix";

const VIEWS: { id: View; label: string }[] = [
  { id: "daily", label: "দৈনিক" },
  { id: "monthly", label: "মাসিক" },
  { id: "yearly", label: "বাৎসরিক" },
];

function Section({ title, sub, children, id }: { title: string; sub?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-4 rounded-xl border border-line bg-surface p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {sub && <p className="mb-3 text-sm text-ink-2">{sub}</p>}
      {!sub && <div className="mb-3" />}
      {children}
    </section>
  );
}

export function CropDashboard({
  crop,
  options,
  initial,
  initialMonth,
}: {
  crop: Crop;
  options: { id: string; bn: string; en: string }[];
  initial: CropAnalytics;
  initialMonth: number | null;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [view, setView] = useState<View>(initial.daily.length > 30 ? "daily" : "monthly");
  const [month, setMonth] = useState<number>(initialMonth ?? Number((initial.latest?.date ?? "2000-01").slice(5, 7)));
  const [year, setYear] = useState<number | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [fetched, setFetched] = useState<{ query: string; data?: CropAnalytics; failed?: boolean } | null>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  const query = toQuery(toFilters(filters, initial.available.last));
  const defaultQuery = toQuery(toFilters(DEFAULT_FILTERS, initial.available.last));
  const isDefault = query === defaultQuery;
  const current = !isDefault && fetched?.query === query ? fetched : null;
  const data = isDefault ? initial : (current?.data ?? fetched?.data ?? initial);
  const loading = !isDefault && !current;
  const error = current?.failed ? "তথ্য লোড করা যায়নি।" : null;

  useEffect(() => {
    if (isDefault) return;
    const ctrl = new AbortController();
    fetch(`/api/crops/${crop.id}?${query}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: CropAnalytics) => setFetched({ query, data: d }))
      .catch((e: Error) => e.name !== "AbortError" && setFetched({ query, failed: true }));
    return () => ctrl.abort();
  }, [crop.id, query, isDefault]);

  useEffect(() => {
    if (initialMonth) monthRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMonth]);

  const series: Point[] = data[view];
  const unit = crop.unit === "kg" ? "কেজি" : "পিস";
  const peakIdx = data.seasonal.find((s) => s.month === data.peakMonth)?.index;
  const lowIdx = data.seasonal.find((s) => s.month === data.lowMonth)?.index;
  const priceWord = PRICE_TYPE_LABELS[filters.priceType];

  const selectCell = (y: number | null, m: number) => {
    setMonth(m);
    if (y) setYear(y);
    monthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {crop.bn} <span className="text-base font-normal text-muted">{crop.en}</span>
          </h1>
          <p className="text-sm text-ink-2">
            {priceWord} দাম, টাকা {unitLabel(crop.unit)} · তথ্য আছে {fmtDate(initial.available.first)} থেকে {fmtDate(initial.available.last)}
          </p>
        </div>
        <label className="text-sm">
          <span className="mr-2 text-muted">অন্য সবজি</span>
          <select
            value={crop.id}
            onChange={(e) => router.push(`/crop/${e.target.value}`)}
            className="rounded-md border border-line bg-surface px-3 py-1.5"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.bn} ({o.en})
              </option>
            ))}
          </select>
        </label>
      </div>

      <FilterBar
        state={filters}
        onChange={(next) => setFilters((f) => ({ ...f, ...next }))}
        available={initial.available}
        loading={loading}
        error={error}
        observations={data.observations}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatTile label="সর্বশেষ দর" value={data.latest ? `${fmtTaka(data.latest.price)}` : "—"} sub={data.latest && fmtPeriod(data.latest.date, true)} />
        <StatTile label="সময়কালের গড়" value={data.range ? fmtTaka(data.range.avg) : "—"} sub={data.range && `${fmtDate(data.range.from)} – ${fmtDate(data.range.to)}`} />
        <StatTile label="সবচেয়ে কম" value={data.range ? fmtTaka(data.range.low.price) : "—"} sub={data.range && fmtPeriod(data.range.low.period, true)} />
        <StatTile label="সবচেয়ে বেশি" value={data.range ? fmtTaka(data.range.high.price) : "—"} sub={data.range && fmtPeriod(data.range.high.period, true)} />
        <StatTile label="৩০ দিনে" value={<ChangeText pct={data.change.month?.pct ?? null} />} />
        <StatTile label="১ বছরে" value={<ChangeText pct={data.change.year?.pct ?? null} />} />
      </div>

      <section className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">
            {priceWord} গড় দাম (টাকা/{unit})
          </h2>
          <div role="tablist" className="flex rounded-md border border-line p-0.5 text-sm">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={`rounded px-3 py-1 ${view === v.id ? "bg-accent text-white dark:text-black" : "text-ink-2"}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        {series.length ? (
          <PriceChart data={series} view={view} unit={unit} />
        ) : (
          <p className="py-16 text-center text-muted">
            {view === "daily" ? "এই ফিল্টারে দৈনিক তথ্য নেই — মাসিক দেখুন।" : "এই ফিল্টারে কোনো তথ্য নেই।"}
          </p>
        )}
        <p className="mt-2 text-xs text-muted">
          ছায়া অংশ = সর্বনিম্ন থেকে সর্বোচ্চ দাম।
          {view === "daily" && data.dailySources.length > 0 && ` দৈনিক উৎস: ${data.dailySources.map((s) => SOURCE_LABELS[s]).join(", ")}।`}
        </p>
      </section>

      <Section
        title="বছর × মাস: কোন মাসে কত দাম"
        sub="প্রতি ঘরে ওই মাসের গড় দাম। রং = ওই বছরের গড়ের তুলনায় (লাল = বেশি, নীল = কম)। ঘরে ক্লিক করলে নিচে সেই মাসের বিস্তারিত দেখাবে।"
      >
        <YearMonthMatrix rows={data.matrix} selected={{ year, month }} onSelect={selectCell} />
      </Section>

      <div ref={monthRef} className="scroll-mt-4">
        <Section title={`মাস ধরে দেখুন: ${monthName(month)}`}>
          <MonthFocus data={data} month={month} year={year} unit={unit} onMonth={setMonth} onYear={setYear} />
        </Section>
      </div>

      {data.matrix.length > 1 && (
        <Section title="বছরে বছরে তুলনা" sub="প্রতি বছরের মাসিক গড় দাম একই ছকে। একটি বছর বাছুন, বাকিগুলো ধূসর থাকবে।">
          <YearCompareChart rows={data.matrix} selectedYear={year} onSelectYear={setYear} />
        </Section>
      )}

      <Section title="মাসভিত্তিক মৌসুমি দাম" sub="প্রতিটি মাসের গড় দাম, ওই বছরের গড়ের তুলনায় শতকরা কত। ১০০-এর বেশি = স্বাভাবিকের চেয়ে দামি।">
        <SeasonalChart data={data.seasonal} />
        {data.peakMonth && data.lowMonth ? (
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md border-l-4 border-up bg-page p-3">
              <div className="font-medium">
                দাম সবচেয়ে বেশি: {monthName(data.peakMonth)}
                {peakIdx != null && ` (গড়ের ${fmtNum(Math.round(peakIdx - 100))}% বেশি)`}
              </div>
              <div className="text-ink-2">এই সময়ে ফসল বাজারে আনতে পারলে ভালো দাম পাওয়ার সম্ভাবনা বেশি।</div>
            </div>
            <div className="rounded-md border-l-4 border-down bg-page p-3">
              <div className="font-medium">
                দাম সবচেয়ে কম: {monthName(data.lowMonth)}
                {lowIdx != null && ` (গড়ের ${fmtNum(Math.round(100 - lowIdx))}% কম)`}
              </div>
              <div className="text-ink-2">সাধারণত মৌসুমে সরবরাহ বেশি থাকে, তাই দাম কমে।</div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">মৌসুমি ধরন বের করতে অন্তত ৬ মাসের তুলনাযোগ্য তথ্য দরকার।</p>
        )}
      </Section>

      <Section title="আসল দর (উৎস যেভাবে প্রকাশ করেছে)">
        {showRaw ? (
          <RawTable cropId={crop.id} query={query} unit={unit} />
        ) : (
          <button onClick={() => setShowRaw(true)} className="rounded-md border border-line px-3 py-1.5 text-sm text-accent hover:bg-page">
            প্রতিটি দিন ও বাজারের আসল দর দেখুন
          </button>
        )}
      </Section>
    </div>
  );
}
