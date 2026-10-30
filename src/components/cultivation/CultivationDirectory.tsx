"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CROPS, GROUP_LABELS, type CropGroup } from "@/lib/catalogue";
import { getCropAgronomy } from "@/lib/cropAgronomy";
import { getCropAdvisory } from "@/lib/cropAdvisory";
import { getCropImage } from "@/lib/cropImages";
import { CropImage } from "../CropImage";
import { CropCultivationTab } from "../crop/CropCultivationTab";

const GROUPS: { id: "all" | CropGroup; label: string }[] = [
  { id: "all", label: "সবগুলো ফসল" },
  { id: "vegetable", label: "সবজি" },
  { id: "leafy", label: "শাকসবজি" },
  { id: "tuber", label: "কন্দ জাতীয়" },
  { id: "spice", label: "মসলা জাতীয়" },
];

export function CultivationDirectory() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<"all" | CropGroup>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedCropId, setExpandedCropId] = useState<string | null>(null);

  const filteredCrops = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CROPS.filter((c) => {
      const matchGroup = group === "all" || c.group === group;
      if (!matchGroup) return false;
      if (!q) return true;
      return (
        c.bn.toLowerCase().includes(q) ||
        c.en.toLowerCase().includes(q) ||
        (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(q)))
      );
    });
  }, [search, group]);

  const toggleExpand = (id: string) => {
    setExpandedCropId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-page px-2.5 py-0.5 text-xs font-medium text-ink-2">
              <span>🌱</span>
              <span>কৃষি সম্প্রসারণ ও বারি (BARI) সুপারিশকৃত</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-ink sm:text-2xl md:text-3xl">
              সকল ফসলের আধুনিক চাষাবাদ নির্দেশিকা
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm max-w-2xl">
              মাটি তৈরি, বীজ শোধন, রোপণের দূরত্ব, শতাংশ প্রতি সুষম সারের মাত্রা ও ফলন সংগ্রহের সঠিক নিয়মাবলি
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="rounded-xl border border-line bg-page px-3.5 py-2 text-center shadow-2xs">
              <div className="text-[11px] text-muted">মোট তালিকাভুক্ত ফসল</div>
              <div className="text-sm font-semibold text-ink">{CROPS.length} টি</div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center justify-between pt-4 border-t border-line">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ফসলের নাম দিয়ে খুঁজুন (যেমন: আলু, টমেটো, মরিচ...)"
              className="w-full rounded-xl border border-line bg-page pl-10 pr-4 py-2 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-ink text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-line bg-page p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "grid" ? "bg-surface text-ink shadow-2xs font-bold" : "text-muted hover:text-ink"
                }`}
                title="গ্রিড ভিউ"
              >
                গ্রিড
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "list" ? "bg-surface text-ink shadow-2xs font-bold" : "text-muted hover:text-ink"
                }`}
                title="তালিকা ভিউ"
              >
                তালিকা
              </button>
            </div>
          </div>
        </div>

        {/* Group Badges */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                group === g.id
                  ? "bg-accent text-white shadow-xs"
                  : "bg-page hover:bg-surface border border-line text-ink-2 hover:text-ink"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted px-1">
        <span>{filteredCrops.length} টি ফসল প্রদর্শিত হচ্ছে</span>
        {search && <span>অনুসন্ধান: &ldquo;{search}&rdquo;</span>}
      </div>

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCrops.map((c) => {
            const advisory = getCropAdvisory(c.id);
            const agronomy = getCropAgronomy(c.id);
            const isExpanded = expandedCropId === c.id;

            return (
              <div
                key={c.id}
                className={`flex flex-col rounded-2xl border transition-all ${
                  isExpanded
                    ? "col-span-1 md:col-span-2 lg:col-span-3 border-line bg-surface shadow-md"
                    : "border-line bg-surface p-4 hover:border-line/90 shadow-2xs hover:shadow-xs"
                }`}
              >
                {/* Compact Card Content */}
                <div className={`flex flex-col gap-3.5 ${isExpanded ? "p-5 border-b border-line bg-page/30" : ""}`}>
                  <div className="flex items-start gap-3.5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line shadow-2xs">
                      <CropImage src={getCropImage(c.id)} alt={c.bn} sizes="56px" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full border border-line bg-page px-2 py-0.5 text-[10px] font-medium text-ink-2">
                          {GROUP_LABELS[c.group]}
                        </span>
                        <Link
                          href={`/crop/${c.id}`}
                          className="text-xs text-muted hover:text-accent font-medium transition-colors"
                        >
                          বাজার দর →
                        </Link>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-ink truncate">
                        {c.bn} <span className="text-xs font-normal text-muted">({c.en})</span>
                      </h3>
                      <div className="mt-0.5 text-[11px] text-muted">
                        মৌসুম: {advisory.plantingWindow.split("(")[0]}
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-line/60 bg-page/50 p-2.5">
                      <span className="block text-[10px] text-muted font-medium">ফলন আসার সময়:</span>
                      <span className="font-semibold text-ink">{advisory.growthDays}</span>
                    </div>
                    <div className="rounded-xl border border-line/60 bg-page/50 p-2.5">
                      <span className="block text-[10px] text-muted font-medium">রোপণের দূরত্ব:</span>
                      <span className="font-semibold text-ink truncate block" title={agronomy.cultivation.spacing}>
                        {agronomy.cultivation.spacing.split(".")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Expand / View Button */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => toggleExpand(c.id)}
                      className={`flex-1 rounded-xl py-2 px-3 text-xs font-semibold transition-all text-center ${
                        isExpanded
                          ? "border border-line bg-page text-ink-2 hover:bg-surface"
                          : "border border-line bg-page text-ink hover:bg-surface hover:border-accent/40 shadow-2xs"
                      }`}
                    >
                      {isExpanded ? "▲ সংক্ষেপ করুন" : "🌱 চাষাবাদ ও সার ছক"}
                    </button>
                    <Link
                      href={`/crop/${c.id}`}
                      className="rounded-xl border border-line bg-page px-3 py-2 text-xs font-medium text-muted hover:text-ink hover:bg-surface text-center transition-colors"
                      title="ফসলটির পূর্ণাঙ্গ প্রোফাইল ও বাজার দর"
                    >
                      প্রোফাইল
                    </Link>
                  </div>
                </div>

                {/* Expanded Full Cultivation Tab */}
                {isExpanded && (
                  <div className="p-5 md:p-6 bg-surface">
                    <CropCultivationTab crop={c} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-2.5">
          {filteredCrops.map((c) => {
            const advisory = getCropAdvisory(c.id);
            const isExpanded = expandedCropId === c.id;

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-surface transition-all overflow-hidden shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line shadow-2xs">
                      <CropImage src={getCropImage(c.id)} alt={c.bn} sizes="48px" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-line bg-page px-2 py-0.5 text-[10px] font-medium text-ink-2">
                          {GROUP_LABELS[c.group]}
                        </span>
                        <h3 className="font-bold text-base text-ink">
                          {c.bn} <span className="text-xs font-normal text-muted">({c.en})</span>
                        </h3>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                        <span>মৌসুম: <strong className="text-ink font-medium">{advisory.plantingWindow.split("(")[0]}</strong></span>
                        <span>•</span>
                        <span>ফলন সময়: <strong className="text-ink font-medium">{advisory.growthDays}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => toggleExpand(c.id)}
                      className="rounded-xl border border-line bg-page px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface hover:border-accent/40 shadow-2xs transition-colors"
                    >
                      {isExpanded ? "সংক্ষেপ করুন" : "🌱 নির্দেশিকা"}
                    </button>
                    <Link
                      href={`/crop/${c.id}`}
                      className="rounded-xl border border-line bg-page px-3 py-1.5 text-xs font-medium text-muted hover:text-ink hover:bg-surface transition-colors"
                    >
                      বাজার দর
                    </Link>
                  </div>
                </div>

                {/* Expanded Full Cultivation Details */}
                {isExpanded && (
                  <div className="border-t border-line p-5 md:p-6 bg-surface">
                    <CropCultivationTab crop={c} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filteredCrops.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-12 text-center text-muted">
          <p className="text-base font-semibold">কোনো ফসল পাওয়া যায়নি</p>
          <p className="mt-1 text-xs">অনুসন্ধান বা ক্যাটাগরি পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
        </div>
      )}
    </div>
  );
}
