"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CROPS, GROUP_LABELS, type Crop } from "@/lib/catalogue";
import { getCropAgronomy, type DiseaseItem, type Medicine } from "@/lib/cropAgronomy";
import { getCropImage } from "@/lib/cropImages";
import { CropImage } from "../CropImage";
import { CropDiseaseTab } from "../crop/CropDiseaseTab";

const DISEASE_TYPES = [
  { id: "all", label: "সকল ধরন" },
  { id: "ছত্রাকজনিত রোগ", label: "ছত্রাকজনিত" },
  { id: "ক্ষতিকর পোকা", label: "ক্ষতিকর পোকা" },
  { id: "ব্যাকটেরিয়াজনিত রোগ", label: "ব্যাকটেরিয়াজনিত" },
  { id: "ভাইরাসজনিত রোগ", label: "ভাইরাসজনিত" },
];

interface FlattenedDisease {
  crop: Crop;
  disease: DiseaseItem;
}

export function DiseaseDirectory() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCropId, setSelectedCropId] = useState("all");
  const [expandedCropId, setExpandedCropId] = useState<string | null>(null);
  const [viewBy, setViewBy] = useState<"crop" | "disease">("crop");

  // Flattened list of all diseases across all crops for fast searching & disease-centric view
  const allDiseases = useMemo(() => {
    const list: FlattenedDisease[] = [];
    CROPS.forEach((crop) => {
      const agronomy = getCropAgronomy(crop.id);
      agronomy.diseases.forEach((disease) => {
        list.push({ crop, disease });
      });
    });
    return list;
  }, []);

  // Filtered by search & dropdowns
  const filteredDiseases = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allDiseases.filter(({ crop, disease }) => {
      if (selectedType !== "all" && disease.type !== selectedType) return false;
      if (selectedCropId !== "all" && crop.id !== selectedCropId) return false;
      if (!q) return true;

      const matchCrop =
        crop.bn.toLowerCase().includes(q) ||
        crop.en.toLowerCase().includes(q) ||
        (crop.aliases && crop.aliases.some((a) => a.toLowerCase().includes(q)));
      const matchDiseaseName = disease.name.toLowerCase().includes(q);
      const matchSymptoms = disease.symptoms.toLowerCase().includes(q);
      const matchMedicine = disease.medicines.some(
        (m: Medicine) =>
          m.tradeName.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.dosage.toLowerCase().includes(q)
      );

      return matchCrop || matchDiseaseName || matchSymptoms || matchMedicine;
    });
  }, [allDiseases, search, selectedType, selectedCropId]);

  // Grouped by crop for crop view
  const cropsWithFilteredDiseases = useMemo(() => {
    const cropMap = new Map<string, { crop: Crop; diseases: DiseaseItem[] }>();
    filteredDiseases.forEach(({ crop, disease }) => {
      if (!cropMap.has(crop.id)) {
        cropMap.set(crop.id, { crop, diseases: [] });
      }
      cropMap.get(crop.id)!.diseases.push(disease);
    });
    return Array.from(cropMap.values());
  }, [filteredDiseases]);

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
              <span>🩺</span>
              <span>রোগবালাই নির্ণয় ও বালাইনাশক সহায়িকা</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-ink sm:text-2xl md:text-3xl">
              ফসলের রোগবালাই, জৈব প্রতিকার ও সঠিক ওষুধ
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm max-w-2xl">
              লক্ষণ দেখে রোগ শনাক্তকরণ, প্রাকৃতিক নিরাময় এবং অনুমোদিত বালাইনাশকের বাণিজ্যিক নাম ও সঠিক প্রয়োগ মাত্রা
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="rounded-xl border border-line bg-page px-3.5 py-2 text-center shadow-2xs">
              <div className="text-[11px] text-muted">তালিকাভুক্ত রোগবালাই</div>
              <div className="text-sm font-semibold text-ink">{allDiseases.length} টি</div>
            </div>
          </div>
        </div>

        {/* Search Box & Controls */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center justify-between pt-4 border-t border-line">
          {/* Universal Search Input */}
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
              placeholder="ফসল, রোগ বা ওষুধের নাম (যেমন: রিডোমিল, নটিভো, ব্লাইট...)"
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

          {/* Controls: Crop Filter & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="rounded-xl border border-line bg-page px-3 py-2 text-xs font-medium text-ink focus:border-accent focus:outline-none"
            >
              <option value="all">সকল ফসল ({CROPS.length})</option>
              {CROPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bn} ({c.en})
                </option>
              ))}
            </select>

            <div className="flex rounded-xl border border-line bg-page p-0.5">
              <button
                type="button"
                onClick={() => setViewBy("crop")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewBy === "crop" ? "bg-surface text-ink shadow-2xs font-bold" : "text-muted hover:text-ink"
                }`}
              >
                ফসলভিত্তিক
              </button>
              <button
                type="button"
                onClick={() => setViewBy("disease")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewBy === "disease" ? "bg-surface text-ink shadow-2xs font-bold" : "text-muted hover:text-ink"
                }`}
              >
                রোগভিত্তিক
              </button>
            </div>
          </div>
        </div>

        {/* Disease Type Filters */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {DISEASE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                selectedType === t.id
                  ? "bg-accent text-white shadow-xs"
                  : "bg-page hover:bg-surface border border-line text-ink-2 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted px-1">
        <span>
          {viewBy === "crop"
            ? `${cropsWithFilteredDiseases.length} টি ফসলে ${filteredDiseases.length} টি রোগবালাই প্রদর্শিত হচ্ছে`
            : `${filteredDiseases.length} টি রোগের প্রতিকার ও ওষুধ প্রদর্শিত হচ্ছে`}
        </span>
        {search && <span>অনুসন্ধান: &ldquo;{search}&rdquo;</span>}
      </div>

      {/* VIEW 1: CROP-BASED VIEW */}
      {viewBy === "crop" && (
        <div className="flex flex-col gap-4">
          {cropsWithFilteredDiseases.map(({ crop, diseases }) => {
            const isExpanded = expandedCropId === crop.id;

            return (
              <div
                key={crop.id}
                className="rounded-2xl border border-line bg-surface overflow-hidden shadow-2xs hover:shadow-xs transition-all"
              >
                {/* Crop Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-line">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line shadow-2xs">
                      <CropImage src={getCropImage(crop.id)} alt={crop.bn} sizes="48px" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-line bg-page px-2 py-0.5 text-[10px] font-medium text-ink-2">
                          {GROUP_LABELS[crop.group]}
                        </span>
                        <span className="text-xs text-muted">
                          রোগবালাই: {diseases.length} টি
                        </span>
                      </div>
                      <h3 className="mt-0.5 text-base sm:text-lg font-bold text-ink">
                        {crop.bn} <span className="text-xs font-normal text-muted">({crop.en})</span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => toggleExpand(crop.id)}
                      className="rounded-xl border border-line bg-page px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface hover:border-accent/40 shadow-2xs transition-colors"
                    >
                      {isExpanded ? "▲ সংক্ষেপ করুন" : "🩺 সকল রোগ ও ওষুধ"}
                    </button>
                    <Link
                      href={`/crop/${crop.id}`}
                      className="rounded-xl border border-line bg-page px-3 py-1.5 text-xs font-medium text-muted hover:text-ink hover:bg-surface transition-colors"
                    >
                      বাজার দর
                    </Link>
                  </div>
                </div>

                {/* Inline preview tags or full expanded guide */}
                {!isExpanded ? (
                  <div className="p-3.5 sm:p-4 flex flex-wrap gap-2 text-xs">
                    <span className="text-muted self-center text-[11px] mr-1">চিহ্নিত রোগ:</span>
                    {diseases.map((d, dIdx) => (
                      <button
                        key={dIdx}
                        onClick={() => toggleExpand(crop.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-page px-2.5 py-1 text-xs text-ink-2 hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                        title={d.symptoms}
                      >
                        <span className="font-medium">{d.name}</span>
                        <span className="text-[10px] text-muted">({d.medicines.length} ওষুধ)</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 md:p-6 bg-surface">
                    <CropDiseaseTab crop={crop} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DISEASE-CENTRIC VIEW */}
      {viewBy === "disease" && (
        <div className="flex flex-col gap-4">
          {filteredDiseases.map(({ crop, disease }, idx) => (
            <div
              key={`${crop.id}-${disease.id || idx}`}
              className="rounded-2xl border border-line bg-surface p-5 shadow-2xs flex flex-col gap-3.5"
            >
              {/* Header with Crop & Disease Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-line">
                    <CropImage src={getCropImage(crop.id)} alt={crop.bn} sizes="40px" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/crop/${crop.id}`}
                        className="font-medium text-ink-2 hover:text-accent text-xs transition-colors"
                      >
                        {crop.bn} ({crop.en})
                      </Link>
                      <span className="text-muted text-xs">•</span>
                      <span className="rounded-full border border-line bg-page px-2 py-0.5 text-[10px] font-medium text-muted">
                        {disease.type}
                      </span>
                    </div>
                    <h3 className="mt-0.5 text-base font-bold text-ink">
                      {disease.name}
                    </h3>
                  </div>
                </div>

                <Link
                  href={`/crop/${crop.id}`}
                  className="rounded-xl border border-line bg-page px-3 py-1.5 text-xs font-medium text-muted hover:text-ink hover:bg-surface transition-colors"
                >
                  ফসল প্রোফাইল →
                </Link>
              </div>

              {/* Symptoms */}
              <div className="rounded-xl border border-line/60 bg-page/60 p-3.5 text-xs sm:text-sm">
                <div className="font-semibold text-ink mb-1 flex items-center gap-1.5">
                  <span>🔍</span>
                  <span>লক্ষণ ও শনাক্তকরণ:</span>
                </div>
                <p className="text-ink-2 leading-relaxed">{disease.symptoms}</p>
              </div>

              {/* Grid: Organic Remedy + Eradication */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="rounded-xl border border-line/60 bg-page/40 p-3.5">
                  <div className="font-semibold text-ink mb-1 flex items-center gap-1.5">
                    <span>🌿</span>
                    <span>প্রাকৃতিক প্রতিকার:</span>
                  </div>
                  <p className="text-ink-2 leading-relaxed">{disease.organicRemedy}</p>
                </div>
                <div className="rounded-xl border border-line/60 bg-page/40 p-3.5">
                  <div className="font-semibold text-ink mb-1 flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>দমন ও নির্মূল:</span>
                  </div>
                  <ul className="space-y-0.5 text-ink-2 list-disc list-inside">
                    {disease.eradication.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Medicines Table */}
              {disease.medicines && disease.medicines.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-ink mb-2 flex items-center gap-1.5">
                    <span>💊</span>
                    <span>অনুমোদিত ওষুধ ও প্রয়োগের সঠিক মাত্রা:</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[550px] border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-line bg-page text-left text-muted">
                          <th className="py-2 px-3 font-semibold">বাণিজ্যিক নাম</th>
                          <th className="py-2 px-3 font-semibold">জেনেরিক উপাদান</th>
                          <th className="py-2 px-3 font-semibold">প্রয়োগের মাত্রা</th>
                          <th className="py-2 px-3 font-semibold">নিয়মাবলী</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60">
                        {disease.medicines.map((med, mIdx) => (
                          <tr key={mIdx} className="hover:bg-page/40">
                            <td className="py-2 px-3 font-semibold text-ink">{med.tradeName}</td>
                            <td className="py-2 px-3 text-muted">{med.genericName}</td>
                            <td className="py-2 px-3 font-semibold text-ink tabular">{med.dosage}</td>
                            <td className="py-2 px-3 text-ink-2">{med.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredDiseases.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-12 text-center text-muted">
          <p className="text-base font-semibold">কোনো রোগ বা বালাইনাশক পাওয়া যায়নি</p>
          <p className="mt-1 text-xs">অনুসন্ধান বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
        </div>
      )}
    </div>
  );
}
