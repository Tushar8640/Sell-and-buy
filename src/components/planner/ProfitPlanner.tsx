"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CROPS, GROUP_LABELS, MONTHS_BN } from "@/lib/catalogue";
import { fmtNum, fmtTaka, monthName } from "@/lib/format";
import { getCropImage } from "@/lib/cropImages";
import { CropImage } from "../CropImage";
import {
  getCropProfitOpportunitiesForMonth,
  getCropFullStrategy,
} from "@/lib/cropProfitPlanner";

interface ProfitPlannerProps {
  cropAverages?: Record<string, { seasonal: (number | null)[]; seasonalPrices: (number | null)[] }>;
  initialMonth?: number;
}

export function ProfitPlanner({ cropAverages, initialMonth }: ProfitPlannerProps) {
  // Current month (defaults to October = 10 if not specified, or current system date)
  const defaultMonth = initialMonth ?? 10;
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [searchCrop, setSearchCrop] = useState<string>("");
  const [activeView, setActiveView] = useState<"by-month" | "by-crop" | "year-matrix">("by-month");

  // Transform cropAverages into Map if passed
  const averagesMap = useMemo(() => {
    if (!cropAverages) return undefined;
    return new Map(Object.entries(cropAverages));
  }, [cropAverages]);

  // Opportunities for selected planting month
  const opportunities = useMemo(() => {
    return getCropProfitOpportunitiesForMonth(selectedMonth, averagesMap);
  }, [selectedMonth, averagesMap]);

  // Crop search results for "by-crop" view
  const searchedCrops = useMemo(() => {
    const q = searchCrop.trim().toLowerCase();
    if (!q) return CROPS;
    return CROPS.filter(
      (c) =>
        c.bn.toLowerCase().includes(q) ||
        c.en.toLowerCase().includes(q) ||
        (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(q)))
    );
  }, [searchCrop]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-page px-2.5 py-0.5 text-xs font-medium text-ink-2">
              <span>💰</span>
              <span>কৃষি মুনাফা ও সর্বোচ্চ বিক্রয়মূল্য নির্দেশিকা</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-ink sm:text-2xl md:text-3xl">
              লাভজনক রোপণ ও বিক্রয় ক্যালেন্ডার
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm max-w-2xl">
              কোন মাসে কোন ফসল রোপণ করলে ফসল তোলার সময়ে বাজারে সর্বোচ্চ দাম পাওয়া যাবে?
              ঐতিহাসিক বাজার দর ও মৌসুম অনুযায়ী সেরা রোপণ সময় নির্ধারণ করুন।
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="rounded-xl border border-line bg-page p-1 shadow-2xs flex">
              <button
                type="button"
                onClick={() => setActiveView("by-month")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeView === "by-month"
                    ? "bg-surface text-ink shadow-2xs font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                মাসভিত্তিক রোপণ
              </button>
              <button
                type="button"
                onClick={() => setActiveView("by-crop")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeView === "by-crop"
                    ? "bg-surface text-ink shadow-2xs font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                ফসলভিত্তিক সেরা সময়
              </button>
              <button
                type="button"
                onClick={() => setActiveView("year-matrix")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeView === "year-matrix"
                    ? "bg-surface text-ink shadow-2xs font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                ১২ মাসের ছক
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: BY PLANTING MONTH */}
      {activeView === "by-month" && (
        <div className="flex flex-col gap-6">
          {/* Month Switcher Carousel / Grid */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
            <div className="text-xs font-semibold text-ink mb-2.5 flex items-center justify-between">
              <span>📅 কোন মাসে চারা বা বীজ রোপণ করতে চান? নির্বাচন করুন:</span>
              <span className="text-[11px] text-muted">নির্বাচিত মাস: {monthName(selectedMonth)}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {MONTHS_BN.map((mName, idx) => {
                const mNumber = idx + 1;
                const isSelected = selectedMonth === mNumber;
                const isCurrent = mNumber === 10; // Current season

                return (
                  <button
                    key={mNumber}
                    type="button"
                    onClick={() => setSelectedMonth(mNumber)}
                    className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-accent text-white border-accent shadow-xs font-bold"
                        : "border-line bg-page hover:bg-surface text-ink-2 hover:text-ink"
                    }`}
                  >
                    <span className="text-xs">{mName}</span>
                    <span
                      className={`text-[9px] mt-0.5 ${
                        isSelected ? "text-white/80" : "text-muted"
                      }`}
                    >
                      মাস {fmtNum(mNumber)}
                    </span>
                    {isCurrent && !isSelected && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-lg font-bold text-ink">
                {monthName(selectedMonth)} মাসে রোপণ করলে যেসকল ফসলে বেশি লাভ হবে
              </h2>
              <p className="text-xs text-muted">
                এই মাসে বীজ বা চারা বসালে ফসল তোলার সময় বাজারে সর্বোচ্চ দাম পাওয়ার সম্ভাবনা থাকে
              </p>
            </div>
            <span className="text-xs text-muted font-medium bg-surface border border-line rounded-lg px-2.5 py-1 self-start sm:self-auto">
              {opportunities.length} টি লাভজনক সুযোগ চিহ্নিত
            </span>
          </div>

          {/* Opportunities List */}
          {opportunities.length > 0 ? (
            <div className="flex flex-col gap-4">
              {opportunities.map((opp, idx) => {
                const unit = opp.crop.unit === "kg" ? "কেজি" : "পিস";

                return (
                  <div
                    key={`${opp.crop.id}-${idx}`}
                    className="rounded-2xl border border-line bg-surface p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-4"
                  >
                    {/* Top Row: Crop info + Profit Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
                      <div className="flex items-center gap-3.5">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line shadow-2xs">
                          <CropImage
                            src={getCropImage(opp.crop.id)}
                            alt={opp.crop.bn}
                            sizes="56px"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-line bg-page px-2 py-0.5 text-[10px] font-medium text-ink-2">
                              {GROUP_LABELS[opp.crop.group]}
                            </span>
                            <span className="text-xs text-muted">
                              {opp.rule.seasonLabel}
                            </span>
                          </div>
                          <h3 className="mt-0.5 text-base sm:text-lg font-bold text-ink">
                            {opp.crop.bn}{" "}
                            <span className="text-xs font-normal text-muted">
                              ({opp.crop.en})
                            </span>
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-line bg-page px-3 py-1 text-xs font-semibold text-ink">
                          <span>🌟</span>
                          <span>{opp.rule.profitBadge}</span>
                        </span>
                      </div>
                    </div>

                    {/* Timeline & Price Projection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Planting Time */}
                      <div className="rounded-xl border border-line/60 bg-page/50 p-3">
                        <span className="block text-[10px] text-muted font-medium">
                          রোপণের সময় ও বৃদ্ধি:
                        </span>
                        <div className="mt-0.5 text-ink font-bold text-sm">
                          {opp.plantingMonthName}
                        </div>
                        <span className="text-[11px] text-muted">
                          ফলন আসতে: {opp.rule.growthDaysText}
                        </span>
                      </div>

                      {/* Expected Harvest Month */}
                      <div className="rounded-xl border border-line/60 bg-page/50 p-3">
                        <span className="block text-[10px] text-muted font-medium">
                          ফসল তোলা ও বিক্রির সময়:
                        </span>
                        <div className="mt-0.5 text-ink font-bold text-sm">
                          {opp.harvestMonthName}
                        </div>
                        <span className="text-[11px] text-muted">
                          এই সময়ে বাজারে চড়া চাহিদা থাকে
                        </span>
                      </div>

                      {/* Expected Price Range */}
                      <div className="rounded-xl border border-line/60 bg-page/50 p-3">
                        <span className="block text-[10px] text-muted font-medium">
                          তোলার সময়ের আনুমানিক দর:
                        </span>
                        <div className="mt-0.5 text-ink font-bold text-sm tabular">
                          {opp.expectedPrice ? `${fmtTaka(opp.expectedPrice)}/${unit}` : "বাজারের সর্বোচ্চ দর"}
                        </div>
                        {opp.regularPrice && opp.expectedPrice && opp.expectedPrice > opp.regularPrice && (
                          <span className="text-[11px] text-muted">
                            ভরা মৌসুমের চেয়ে +{Math.round(((opp.expectedPrice - opp.regularPrice) / opp.regularPrice) * 100)}% বেশি দর
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Strategy & Profit Secret */}
                    <div className="rounded-xl border border-line/70 bg-page/40 p-4 text-xs sm:text-sm">
                      <div className="font-semibold text-ink mb-1 flex items-center gap-1.5">
                        <span>💡</span>
                        <span>লাভবান হওয়ার কৌশল ও বাজার বাস্তবতা:</span>
                      </div>
                      <p className="text-ink-2 leading-relaxed">
                        {opp.rule.strategyDescription}
                      </p>
                      <div className="mt-2 pt-2 border-t border-line/60 text-ink leading-relaxed font-medium">
                        👉 <strong>পরামর্শ:</strong> {opp.rule.actionableTip}
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/crop/${opp.crop.id}`}
                          className="rounded-xl border border-line bg-page px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface hover:border-accent/40 transition-colors"
                        >
                          বাজার দর ও চার্ট →
                        </Link>
                        <Link
                          href={`/cultivation`}
                          className="rounded-xl border border-line bg-page px-3 py-1.5 text-xs font-medium text-muted hover:text-ink hover:bg-surface transition-colors"
                        >
                          চাষাবাদ নির্দেশিকা
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-12 text-center text-muted">
              <p className="text-base font-semibold">এই মাসে কোনো বিশেষ লাভজনক ফসলের তালিকা নেই</p>
              <p className="mt-1 text-xs">অন্য মাস নির্বাচন করে দেখুন।</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BY CROP */}
      {activeView === "by-crop" && (
        <div className="flex flex-col gap-6">
          {/* Crop Search Box */}
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              placeholder="ফসলের নাম দিয়ে খুঁজুন (যেমন: আলু, টমেটো, মরিচ...)"
              className="w-full rounded-xl border border-line bg-surface pl-10 pr-4 py-2 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {searchedCrops.map((crop) => {
              const strategy = getCropFullStrategy(crop.id);
              if (!strategy) return null;

              return (
                <div
                  key={crop.id}
                  className="rounded-2xl border border-line bg-surface p-5 shadow-2xs flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line">
                        <CropImage src={getCropImage(crop.id)} alt={crop.bn} sizes="48px" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-line bg-page px-2 py-0.5 text-[10px] font-medium text-ink-2">
                            {GROUP_LABELS[crop.group]}
                          </span>
                        </div>
                        <h3 className="mt-0.5 text-base font-bold text-ink">
                          {crop.bn} <span className="text-xs font-normal text-muted">({crop.en})</span>
                        </h3>
                      </div>
                    </div>

                    {/* Best Timing Card */}
                    <div className="rounded-xl border border-line/60 bg-page/60 p-3.5 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-ink">সর্বোচ্চ লাভের সেরা রোপণ সময়:</span>
                        <span className="font-bold text-accent">{strategy.bestPlantingName}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted">
                        <span>ফসল তোলা ও চড়া বিক্রির সময়:</span>
                        <span className="font-semibold text-ink">{strategy.bestHarvestName}</span>
                      </div>
                      <p className="mt-2 text-ink-2 leading-relaxed border-t border-line/60 pt-2">
                        {strategy.highestProfitRule.actionableTip}
                      </p>
                    </div>

                    {/* 12-Month Mini Roadmap */}
                    <div>
                      <div className="text-[11px] text-muted mb-1 font-medium">১২ মাসের রোপণ সম্ভাবনা:</div>
                      <div className="grid grid-cols-12 gap-1 text-center text-[10px]">
                        {strategy.all12Months.map((m) => (
                          <div
                            key={m.month}
                            title={`${m.monthName}: ${m.isBest ? "সেরা লাভজনক রোপণ মাস!" : m.canPlant ? "রোপণ করা যায়" : "রোপণ উপযুক্ত নয়"}`}
                            className={`rounded-md py-1 font-medium transition-transform ${
                              m.isBest
                                ? "bg-accent text-white font-bold ring-2 ring-accent/30 scale-105"
                                : m.canPlant
                                ? "bg-accent-soft text-accent"
                                : "bg-page text-muted/50 border border-line/40"
                            }`}
                          >
                            {m.monthName.slice(0, 2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Profile Link */}
                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <Link
                      href={`/crop/${crop.id}`}
                      className="text-xs font-medium text-muted hover:text-accent"
                    >
                      বাজার দর প্রোফাইল →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: 12-MONTH MATRIX */}
      {activeView === "year-matrix" && (
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-2xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-ink">
              বছরের ১২ মাসের লাভজনক রোপণ ও বিক্রয় ছক
            </h2>
            <p className="text-xs text-muted">
              প্রতিটি মাসে কোন কোন ফসল রোপণ করলে সবচেয়ে বেশি লাভ হবে তার পূর্ণাঙ্গ বার্ষিক ওভারভিউ
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[700px] border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-page text-left text-muted">
                  <th className="py-2.5 px-3.5 font-semibold w-24">রোপণের মাস</th>
                  <th className="py-2.5 px-3.5 font-semibold">সর্বোচ্চ লাভজনক ফসলসমূহ</th>
                  <th className="py-2.5 px-3.5 font-semibold w-40">ফসল তোলার মাস</th>
                  <th className="py-2.5 px-3.5 font-semibold">মূল কৌশল ও বাজার দর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {MONTHS_BN.map((mName, idx) => {
                  const mNum = idx + 1;
                  const monthOpps = getCropProfitOpportunitiesForMonth(mNum, averagesMap);

                  return (
                    <tr key={mNum} className="hover:bg-page/40 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-ink align-top bg-page/20 border-r border-line/40">
                        {mName}
                        <span className="block text-[10px] text-muted font-normal">মাস {fmtNum(mNum)}</span>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {monthOpps.slice(0, 4).map((opp, oIdx) => (
                            <Link
                              key={oIdx}
                              href={`/crop/${opp.crop.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors"
                            >
                              <span>{opp.crop.bn}</span>
                              <span className="text-[10px] text-muted">({opp.rule.seasonType === "early" ? "আগাম" : opp.rule.seasonType === "summer" ? "গ্রীষ্ম" : "মৌসুম"})</span>
                            </Link>
                          ))}
                          {monthOpps.length > 4 && (
                            <span className="text-[11px] text-muted self-center">
                              +{monthOpps.length - 4}টি আরও
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-ink align-top">
                        {monthOpps[0] ? monthOpps[0].harvestMonthName : "—"}
                      </td>
                      <td className="py-3 px-3.5 text-xs text-ink-2 align-top leading-relaxed">
                        {monthOpps[0] ? monthOpps[0].rule.actionableTip : "নিয়মিত পরিচর্যা ও জমি প্রস্তুত"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
