import { Suspense } from "react";
import Link from "next/link";
import { Loading } from "@/components/Loading";
import { OverviewBoard } from "@/components/OverviewBoard";
import { StatTile } from "@/components/StatTile";
import { fmtDate, fmtNum, monthName } from "@/lib/format";
import { getOverview } from "@/lib/prices";

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const { rows, meta } = await getOverview();

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">এখনো কোনো তথ্য নেই</h1>
        <p className="mt-2 text-sm text-ink-2 max-w-md mx-auto">
          বাজার দরের তথ্য সংগ্রহ করতে টার্মিনালে{" "}
          <code className="rounded-md bg-page px-2 py-1 font-mono text-xs text-accent">
            npm run collect
          </code>{" "}
          কমান্ডটি চালান।
        </p>
      </div>
    );
  }

  const latest = rows.map((r) => r.latest?.date ?? "").sort().at(-1)!;
  const byPeak = new Map<number, string[]>();
  for (const r of rows) {
    if (r.peakMonth) {
      byPeak.set(r.peakMonth, [...(byPeak.get(r.peakMonth) ?? []), r.crop.bn]);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-accent-soft/20 p-6 md:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft/60 px-3 py-1 text-xs font-semibold text-accent">
            <span>🇧🇩</span>
            <span>বাংলাদেশ কাঁচাবাজার ও কৃষি তথ্য বিশ্লেষণ</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink md:text-3xl">
            বাংলাদেশের সবজির বাজার দর ও মৌসুমি প্রবণতা
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-2 md:text-base">
            কোন মাসে কোন সবজির দাম বেশি বা কম থাকে তা দেখে সঠিক সময়ে চাষ, ক্রয় ও বিক্রয়ের সিদ্ধান্ত নিন।
            দাম কম থাকা মাসগুলোতে বাজারে পর্যাপ্ত সরবরাহ (মৌসুম) থাকে। বিস্তারিত জানতে যেকোনো ফসলে ক্লিক করুন।
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-accent/90 transition-all"
            >
              <span>💰</span>
              <span>লাভজনক রোপণ ক্যালেন্ডার</span>
              <span>→</span>
            </Link>
            <Link
              href="/cultivation"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-xs sm:text-sm font-semibold text-ink hover:bg-page transition-all"
            >
              <span>🌱</span>
              <span>চাষাবাদ নির্দেশিকা</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Stats Row */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatTile
          label="ট্র্যাককৃত ফসল"
          value={fmtNum(rows.length)}
          sub="সবজি, শাক, কন্দ ও মসলা"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m0-20a8 8 0 0 1 8 8c0 4-4 8-8 12M12 2a8 8 0 0 0-8 8c0 4 4 8 8 12" />
            </svg>
          }
        />
        <StatTile
          label="সর্বশেষ আপডেট"
          value={fmtDate(latest)}
          sub="দৈনিক বাজার দর"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
        />
        <StatTile
          label="মোট পর্যবেক্ষণ"
          value={fmtNum(meta.recordCount)}
          sub="ঐতিহাসিক রেকর্ড"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 5-6" />
            </svg>
          }
        />
        <StatTile
          label="তথ্যসূত্র"
          value={fmtNum(meta.sources.length)}
          sub="TCB, DAM ও WFP"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          }
        />
      </section>

      {/* Main Board with Grid / List Toggle & Pagination */}
      <OverviewBoard rows={rows} />

      {/* Peak Month Summary Section */}
      {byPeak.size > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">কোন মাসে কোন ফসলের দাম সবচেয়ে বেশি থাকে</h2>
              <p className="text-xs text-ink-2">কৃষক ও ব্যবসায়ীদের জন্য সর্বোচ্চ মুনাফায় বিক্রির উপযুক্ত সময়</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...byPeak.entries()]
              .sort(([a], [b]) => a - b)
              .map(([m, crops]) => (
                <div
                  key={m}
                  className="flex flex-col justify-between rounded-xl border border-line bg-page/60 p-3.5 transition-colors hover:border-accent/30 hover:bg-page"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-ink">{monthName(m)}</span>
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {fmtNum(crops.length)}টি ফসল
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {crops.map((c) => (
                      <span
                        key={c}
                        className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-ink-2 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Data Sources and Disclaimer */}
      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-xs text-sm">
        <h2 className="font-bold text-base text-ink flex items-center gap-2">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          তথ্যসূত্র ও উপাত্ত সংগ্রহ
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {meta.sources.map((s) => (
            <div key={s.id} className="rounded-xl border border-line bg-page/50 p-3 text-xs">
              <a
                href={s.url}
                className="font-bold text-accent hover:underline flex items-center justify-between"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{s.name}</span>
                <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
              <div className="mt-1 text-ink-2">{s.coverage}</div>
              <div className="mt-2 flex items-center justify-between text-muted text-[11px] pt-2 border-t border-line/40">
                <span>{fmtNum(s.records)} রেকর্ড</span>
                <span>সংগ্রহ: {fmtDate(s.fetchedAt)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-ink-2 flex items-start gap-2.5">
          <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">⚠️ দ্রষ্টব্য:</span>
          <span>
            এখানে প্রদর্শিত তথ্য খুচরা ও পাইকারি বাজারের সাধারণ গড় দর। স্থান ও মানভেদে কৃষক পর্যায়ের (খামারদ্বার)
            দাম সাধারণত খুচরা দামের চেয়ে কম হয়ে থাকে। মৌসুমি সূচক বিগত কয়েক বছরের তথ্যের ওপর ভিত্তি করে প্রস্তুতকৃত
            গড় প্রবণতা, যা আবহাওয়া ও সরবরাহ পরিস্থিতির কারণে পরিবর্তনশীল হতে পারে।
          </span>
        </div>
      </section>
    </div>
  );
}
