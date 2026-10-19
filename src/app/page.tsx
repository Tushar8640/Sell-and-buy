import { Suspense } from "react";
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
      <div className="rounded-xl border border-line bg-surface p-6">
        <h1 className="text-xl font-semibold">এখনো কোনো তথ্য নেই</h1>
        <p className="mt-2 text-ink-2">
          টার্মিনালে <code className="rounded bg-page px-1.5 py-0.5">npm run collect</code> চালিয়ে তথ্য সংগ্রহ করুন।
        </p>
      </div>
    );
  }

  const latest = rows.map((r) => r.latest?.date ?? "").sort().at(-1)!;
  const byPeak = new Map<number, string[]>();
  for (const r of rows) if (r.peakMonth) byPeak.set(r.peakMonth, [...(byPeak.get(r.peakMonth) ?? []), r.crop.bn]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">বাংলাদেশের সবজির বাজার দর</h1>
        <p className="mt-1 max-w-3xl text-ink-2">
          কোন মাসে কোন সবজির দাম বেশি বা কম থাকে, তা দেখে চাষ ও বিক্রির সময় পরিকল্পনা করুন। দাম কম থাকা মাসগুলো সাধারণত
          বাজারে সরবরাহ বেশি থাকার সময় (মৌসুম)। একটি সবজিতে ক্লিক করে দৈনিক, মাসিক ও বাৎসরিক বিশ্লেষণ দেখুন।
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="ফসল" value={fmtNum(rows.length)} />
        <StatTile label="সর্বশেষ তথ্য" value={fmtDate(latest)} />
        <StatTile label="মোট পর্যবেক্ষণ" value={fmtNum(meta.recordCount)} />
        <StatTile label="তথ্যসূত্র" value={fmtNum(meta.sources.length)} />
      </div>

      <OverviewBoard rows={rows} />

      {byPeak.size > 0 && (
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="text-base font-semibold">কোন মাসে কোন ফসলের দাম সবচেয়ে বেশি</h2>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {[...byPeak.entries()]
              .sort(([a], [b]) => a - b)
              .map(([m, crops]) => (
                <li key={m} className="rounded-md bg-page px-3 py-2">
                  <span className="font-medium">{monthName(m)}:</span> <span className="text-ink-2">{crops.join(", ")}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="text-sm text-ink-2">
        <h2 className="font-semibold text-ink">তথ্যসূত্র</h2>
        <ul className="mt-2 list-disc pl-5">
          {meta.sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} className="underline hover:text-accent" target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>{" "}
              — {s.coverage}; {fmtNum(s.records)} রেকর্ড; সংগ্রহ {fmtDate(s.fetchedAt)}; লাইসেন্স {s.licence}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          সতর্কতা: দাম খুচরা বাজারের; কৃষক পর্যায়ের (খামারদ্বার) দাম সাধারণত কম হয়। মৌসুমি সূচক কয়েক বছরের তথ্যের গড়, তাই
          ভবিষ্যতের নিশ্চয়তা নয়।
        </p>
      </section>
    </div>
  );
}
