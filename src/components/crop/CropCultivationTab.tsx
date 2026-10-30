"use client";

import type { Crop } from "@/lib/catalogue";
import { getCropAgronomy } from "@/lib/cropAgronomy";
import { getCropAdvisory } from "@/lib/cropAdvisory";

interface CropCultivationTabProps {
  crop: Crop;
}

export function CropCultivationTab({ crop }: CropCultivationTabProps) {
  const agronomy = getCropAgronomy(crop.id);
  const advisory = getCropAdvisory(crop.id);
  const { cultivation } = agronomy;

  return (
    <div className="flex flex-col gap-5 text-sm text-ink-2">
      {/* Overview Highlights Banner */}
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-page px-2.5 py-0.5 text-xs font-medium text-ink-2">
              <span>🌱</span>
              <span>আধুনিক ও লাভজনক চাষ পদ্ধতি</span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl">
              {crop.bn} চাষের আধুনিক নির্দেশিকা
            </h2>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) ও কৃষি সম্প্রসারণ অধিদপ্তর অনুমোদিত নিয়মাবলি
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <div className="rounded-xl border border-line bg-page px-3.5 py-2 text-center shadow-2xs">
              <div className="text-[11px] text-muted">ফলন আসতে সময়</div>
              <div className="text-sm font-semibold text-ink">{advisory.growthDays}</div>
            </div>
            <div className="rounded-xl border border-line bg-page px-3.5 py-2 text-center shadow-2xs">
              <div className="text-[11px] text-muted">উপযুক্ত রোপণ মৌসুম</div>
              <div className="text-sm font-semibold text-ink">{advisory.plantingWindow.split("(")[0]}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Card 1: Land Preparation & Soil */}
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-page text-sm">
              🚜
            </span>
            <div>
              <h3 className="font-bold text-base text-ink">জমি প্রস্তুত ও মাটি নির্বাচন</h3>
              <p className="text-xs text-muted">মাটি তৈরির সঠিক নিয়ম</p>
            </div>
          </div>
          <p className="mt-3 leading-relaxed text-xs sm:text-sm text-ink-2">
            {cultivation.landPrep}
          </p>
        </section>

        {/* Card 2: Spacing & Seed Treatment */}
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-page text-sm">
              🌾
            </span>
            <div>
              <h3 className="font-bold text-base text-ink">রোপণের দূরত্ব ও বীজ শোধন</h3>
              <p className="text-xs text-muted">সঠিক পরিমাপ ও শোধন পদ্ধতি</p>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-xs sm:text-sm text-ink-2">
            <div className="rounded-xl border border-line/60 bg-page/60 p-3">
              <span className="font-semibold text-ink">দূরত্ব: </span>
              <span>{cultivation.spacing}</span>
            </div>
            <div className="rounded-xl border border-line/60 bg-page/60 p-3">
              <span className="font-semibold text-ink">বীজ শোধন ও হার: </span>
              <span>{cultivation.seedRateAndTreatment}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Card 3: Fertilizer Application Schedule (Full Width Table) */}
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-page text-sm">
              🧪
            </span>
            <div>
              <h3 className="font-bold text-base text-ink">সুষম সার প্রয়োগ সময়সূচি</h3>
              <p className="text-xs text-muted">শতাংশ প্রতি অনুমোদিত সারের মাত্রা ও ধাপসমূহ</p>
            </div>
          </div>
          <span className="rounded-lg border border-line bg-page px-2.5 py-1 text-xs text-muted font-medium">
            প্রতি শতকের হিসেবে
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[580px] border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-line bg-page text-left text-muted">
                <th className="py-2.5 px-3.5 font-semibold">প্রয়োগের ধাপ / সময়</th>
                <th className="py-2.5 px-3.5 font-semibold">সারের নাম</th>
                <th className="py-2.5 px-3.5 font-semibold">শতাংশ প্রতি মাত্রা</th>
                <th className="py-2.5 px-3.5 font-semibold">মন্তব্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {cultivation.fertilizerSchedule.map((stage, sIdx) =>
                stage.fertilizers.map((fert, fIdx) => (
                  <tr key={`${sIdx}-${fIdx}`} className="hover:bg-page/40 transition-colors">
                    {fIdx === 0 && (
                      <td
                        rowSpan={stage.fertilizers.length}
                        className="py-3 px-3.5 font-semibold text-ink align-top bg-page/30 border-r border-line/50 max-w-[200px]"
                      >
                        {stage.stage}
                      </td>
                    )}
                    <td className="py-2.5 px-3.5 font-medium text-ink">{fert.name}</td>
                    <td className="py-2.5 px-3.5 font-semibold text-ink tabular">{fert.amountPerDecimal}</td>
                    <td className="py-2.5 px-3.5 text-muted text-xs">{fert.note || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Card 4: Irrigation and Drainage */}
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-page text-sm">
              💧
            </span>
            <div>
              <h3 className="font-bold text-base text-ink">সেচ ও পানি নিষ্কাশন</h3>
              <p className="text-xs text-muted">পানি ব্যবস্থাপনার নিয়ম</p>
            </div>
          </div>
          <p className="mt-3 leading-relaxed text-xs sm:text-sm text-ink-2">
            {cultivation.irrigation}
          </p>
        </section>

        {/* Card 5: Harvesting & Yield */}
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-page text-sm">
              📦
            </span>
            <div>
              <h3 className="font-bold text-base text-ink">ফসল সংগ্রহ ও ফলন</h3>
              <p className="text-xs text-muted">তোলার সঠিক সময় ও পদ্ধতি</p>
            </div>
          </div>
          <p className="mt-3 leading-relaxed text-xs sm:text-sm text-ink-2">
            {cultivation.harvesting}
          </p>
        </section>
      </div>

      {/* Card 6: Special Weeding & Intercare Tips */}
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
        <h3 className="font-bold text-base text-ink flex items-center gap-2">
          <span>✂️</span>
          <span>আগাছা দমন ও অন্তর্বর্তীকালীন পরিচর্যা</span>
        </h3>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {cultivation.weedingAndIntercare.map((tip, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 rounded-xl border border-line/60 bg-page/50 p-3 text-xs sm:text-sm leading-relaxed"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-page font-semibold text-ink text-xs">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
