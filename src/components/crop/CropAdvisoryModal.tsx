"use client";

import { useEffect, useState } from "react";
import type { Crop } from "@/lib/catalogue";
import { fmtNum, fmtTaka, monthName, unitLabel } from "@/lib/format";
import { getCropImage } from "@/lib/cropImages";
import { getCropAdvisory } from "@/lib/cropAdvisory";
import { CropImage } from "../CropImage";

interface CropAdvisoryModalProps {
  crop: Crop;
  peakMonth: number | null;
  lowMonth: number | null;
  seasonal: { month: number; index: number | null; avgPrice: number | null }[];
}

export function CropAdvisoryModal({
  crop,
  peakMonth,
  lowMonth,
  seasonal,
}: CropAdvisoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const advisory = getCropAdvisory(crop.id);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const peakMonthData = seasonal.find((s) => s.month === peakMonth);
  const lowMonthData = seasonal.find((s) => s.month === lowMonth);

  return (
    <>
      {/* Trigger Button on Details Page */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-page hover:border-accent/40 shadow-2xs"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-soft text-accent">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.493 1.508 1.333 1.508 2.316V18" />
          </svg>
        </span>
        <div className="text-left">
          <span className="font-semibold text-ink">লাভজনক চাষ ও বিক্রয় পরামর্শ</span>
        </div>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line bg-surface px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line shadow-2xs">
                  <CropImage src={getCropImage(crop.id)} alt={crop.bn} sizes="48px" className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                      কৃষি লাভ গাইড
                    </span>
                    <span className="text-xs text-muted">একক: {unitLabel(crop.unit)}</span>
                  </div>
                  <h2 className="mt-0.5 text-lg font-bold text-ink sm:text-xl">
                    {crop.bn} চাষে সর্বোচ্চ লাভ ও বাজার কৌশল
                  </h2>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink-2 transition-colors hover:bg-page hover:text-ink"
                aria-label="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-5 md:p-6 space-y-6 text-sm text-ink-2">
              {/* Quick Summary Metric Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Planting Window */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m0-20a8 8 0 0 1 8 8c0 4-4 8-8 12M12 2a8 8 0 0 0-8 8c0 4 4 8 8 12" />
                    </svg>
                    <span>সেরা রোপণ সময়</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-ink">{advisory.plantingWindow}</div>
                  <div className="mt-0.5 text-[11px] text-muted">ফলন আসতে: {advisory.growthDays}</div>
                </div>

                {/* Peak Price Month */}
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                    </svg>
                    <span>সর্বোচ্চ দামের সময়</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-ink">
                    {peakMonth ? monthName(peakMonth) : "—"}
                    {peakMonthData?.avgPrice && (
                      <span className="ml-1 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                        (গড় {fmtTaka(Math.round(peakMonthData.avgPrice))})
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">বাজারের সর্বোচ্চ মূল্যের সময়</div>
                </div>

                {/* Lowest Harvest Price */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
                    </svg>
                    <span>সবচেয়ে কম দামের মাস</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-ink">
                    {lowMonth ? monthName(lowMonth) : "—"}
                    {lowMonthData?.avgPrice && (
                      <span className="ml-1 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        (গড় {fmtTaka(Math.round(lowMonthData.avgPrice))})
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">প্রচুর সরবরাহ (পিক হার্ভেস্ট)</div>
                </div>
              </div>

              {/* Section 1: Peak Price & Market Timing Strategy */}
              <div className="rounded-xl border border-line bg-page/60 p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    🎯
                  </span>
                  ১. কখন সবচেয়ে বেশি দাম পাওয়া যাবে (বাজার কৌশল)
                </h3>
                <div className="mt-3 space-y-2 leading-relaxed">
                  <p>
                    ঐতিহাসিক বাজার বিশ্লেষণ অনুযায়ী,{" "}
                    <strong className="text-ink">{crop.bn}</strong>-এর দাম সাধারণত{" "}
                    <strong className="text-rose-600 dark:text-rose-400">
                      {peakMonth ? monthName(peakMonth) : advisory.highPricePeriod}
                    </strong>{" "}
                    মাসে সবচেয়ে বেশি থাকে। এ সময় বাজারে সাধারণ মৌসুমের তুলনায় সরবরাহ অনেক কমে যায় অথবা চাহিদা ব্যাপক বেড়ে যায়।
                  </p>
                  {peakMonthData?.avgPrice && lowMonthData?.avgPrice && (
                    <div className="rounded-lg border border-line/80 bg-surface p-3 text-xs">
                      <div className="font-semibold text-ink">📊 সম্ভাব্য মুনাফার ফারাক:</div>
                      <div className="mt-1 text-ink-2">
                        সাধারণ ভরা মৌসুমে দাম গড়ে{" "}
                        <strong className="text-blue-600 dark:text-blue-400">
                          {fmtTaka(Math.round(lowMonthData.avgPrice))}
                        </strong>
                        , অথচ চড়া মৌসুমে দাম বেড়ে গড়ে{" "}
                        <strong className="text-rose-600 dark:text-rose-400">
                          {fmtTaka(Math.round(peakMonthData.avgPrice))}
                        </strong>{" "}
                        পর্যন্ত পৌঁছায়। অর্থাৎ সঠিক সময়ে বাজারে তুলতে পারলে প্রায়{" "}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {fmtNum(
                            Math.round(
                              ((peakMonthData.avgPrice - lowMonthData.avgPrice) / lowMonthData.avgPrice) * 100
                            )
                          )}
                          %
                        </span>{" "}
                        বেশি দাম পাওয়া সম্ভব!
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted">
                    {advisory.storageAndMarketing}
                  </p>
                </div>
              </div>

              {/* Section 2: When and How to Plant */}
              <div className="rounded-xl border border-line bg-page/60 p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    🌱
                  </span>
                  ২. কখন ও কীভাবে রোপণ করলে লাভ বেশি হবে
                </h3>
                <div className="mt-3 space-y-3 leading-relaxed">
                  <div className="rounded-lg border border-line/80 bg-surface p-3">
                    <div className="font-semibold text-xs text-accent">⚡ আগাম চাষের কৌশল (Early Harvesting):</div>
                    <p className="mt-1 text-xs">{advisory.earlyHarvestStrategy}</p>
                  </div>

                  <div>
                    <div className="font-semibold text-xs text-ink mb-1.5">উচ্চফলনশীল ও লাভজনক জাতসমূহ:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {advisory.varieties.map((v) => (
                        <span
                          key={v}
                          className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink"
                        >
                          ✓ {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Pro Profit Tips */}
              <div className="rounded-xl border border-line bg-page/60 p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    💰
                  </span>
                  ৩. মুনাফা দ্বিগুণ করার বিশেষ পদক্ষেপসমূহ
                </h3>
                <ul className="mt-3 space-y-2">
                  {advisory.profitTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 rounded-lg border border-line/60 bg-surface p-3 text-xs leading-relaxed">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 font-bold text-accent text-[11px]">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 4: Soil, Care & Precautions */}
              <div className="rounded-xl border border-line bg-page/60 p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    🌾
                  </span>
                  ৪. মাটি, পরিচর্যা ও রোগবালাই নিয়ন্ত্রণ
                </h3>
                <p className="mt-2 text-xs leading-relaxed">
                  {advisory.soilAndCare}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-line bg-page/50 px-5 py-3 text-xs">
              <span className="text-muted">
                তথ্যসূত্র: বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) ও বাজার প্রবণতা
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-accent px-4 py-2 font-bold text-white shadow-xs transition-colors hover:opacity-90 active:scale-95"
              >
                পরামর্শ বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
