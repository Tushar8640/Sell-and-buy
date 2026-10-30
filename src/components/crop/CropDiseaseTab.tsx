"use client";

import { useState } from "react";
import type { Crop } from "@/lib/catalogue";
import { getCropAgronomy } from "@/lib/cropAgronomy";

interface CropDiseaseTabProps {
  crop: Crop;
}

export function CropDiseaseTab({ crop }: CropDiseaseTabProps) {
  const agronomy = getCropAgronomy(crop.id);
  const [selectedType, setSelectedType] = useState<string>("all");

  const types = ["all", ...Array.from(new Set(agronomy.diseases.map((d) => d.type)))];

  const filteredDiseases =
    selectedType === "all"
      ? agronomy.diseases
      : agronomy.diseases.filter((d) => d.type === selectedType);

  return (
    <div className="flex flex-col gap-5 text-sm text-ink-2">
      {/* Header Banner */}
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-page px-2.5 py-0.5 text-xs font-medium text-ink-2">
              <span>🩺</span>
              <span>রোগবালাই ও বালাইনাশক সহায়িকা</span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl">
              {crop.bn} ফসলের রোগবালাই, দমন ও অনুমোদিত ওষুধ
            </h2>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              লক্ষণ দেখে রোগ শনাক্তকরণ, প্রাকৃতিক প্রতিকার এবং সঠিক মাত্রায় অনুমোদিত বালাইনাশকের তালিকা
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-line bg-page px-3.5 py-2 text-xs font-semibold text-ink shadow-2xs">
              মোট রোগবালাই: {agronomy.diseases.length} টি
            </span>
          </div>
        </div>

        {/* Filter Buttons */}
        {types.length > 2 && (
          <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-line">
            <span className="text-xs text-muted self-center mr-1">ফিল্টার:</span>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedType === type
                    ? "bg-accent text-white shadow-xs"
                    : "bg-surface hover:bg-page border border-line text-ink-2 hover:text-ink"
                }`}
              >
                {type === "all" ? "সকল রোগবালাই" : type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Disease Cards List */}
      <div className="flex flex-col gap-5">
        {filteredDiseases.map((disease, idx) => (
          <div
            key={disease.id || idx}
            className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-2xs flex flex-col gap-4"
          >
            {/* Card Top: Name & Type Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-page text-xs font-semibold text-ink">
                  {idx + 1}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-ink">
                  {disease.name}
                </h3>
              </div>
              <span className="inline-flex items-center rounded-full border border-line bg-page px-2.5 py-0.5 text-xs font-medium text-ink-2">
                {disease.type}
              </span>
            </div>

            {/* Symptoms Box */}
            <div className="rounded-xl border border-line/70 bg-page/60 p-4 text-xs sm:text-sm">
              <div className="font-semibold text-ink mb-1 flex items-center gap-1.5">
                <span>🔍</span>
                <span>রোগের লক্ষণ ও শনাক্তকরণ:</span>
              </div>
              <p className="text-ink-2 leading-relaxed">{disease.symptoms}</p>
            </div>

            {/* Grid: Organic Remedy + Field Eradication Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organic / Natural Remedy */}
              <div className="rounded-xl border border-line/70 bg-page/40 p-4 text-xs sm:text-sm">
                <div className="font-semibold text-ink mb-1.5 flex items-center gap-1.5">
                  <span>🌿</span>
                  <span>প্রাকৃতিক ও জৈব প্রতিকার:</span>
                </div>
                <p className="text-ink-2 leading-relaxed">{disease.organicRemedy}</p>
              </div>

              {/* Eradication & Management */}
              <div className="rounded-xl border border-line/70 bg-page/40 p-4 text-xs sm:text-sm">
                <div className="font-semibold text-ink mb-1.5 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>দমন ও নির্মূলের উপায়:</span>
                </div>
                <ul className="space-y-1 text-ink-2 list-disc list-inside">
                  {disease.eradication.map((step, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Medicines / Chemical Controls Table */}
            {disease.medicines && disease.medicines.length > 0 && (
              <div className="mt-1">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-page text-xs">
                    💊
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-ink">
                    অনুমোদিত ওষুধ ও প্রয়োগের সঠিক মাত্রা
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="w-full min-w-[580px] border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-line bg-page text-left text-muted">
                        <th className="py-2.5 px-3.5 font-semibold">বাণিজ্যিক নাম (Trade Name)</th>
                        <th className="py-2.5 px-3.5 font-semibold">জেনেরিক / উপাদান</th>
                        <th className="py-2.5 px-3.5 font-semibold">প্রয়োগের মাত্রা</th>
                        <th className="py-2.5 px-3.5 font-semibold">স্প্রে করার নিয়ম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {disease.medicines.map((med, mIdx) => (
                        <tr key={mIdx} className="hover:bg-page/40 transition-colors">
                          <td className="py-2.5 px-3.5 font-semibold text-ink">
                            {med.tradeName}
                          </td>
                          <td className="py-2.5 px-3.5 text-xs text-muted">
                            {med.genericName}
                          </td>
                          <td className="py-2.5 px-3.5 font-semibold text-ink tabular">
                            {med.dosage}
                          </td>
                          <td className="py-2.5 px-3.5 text-ink-2 text-xs">
                            {med.instructions}
                          </td>
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

      {/* Safety Precautions & Pre-Harvest Interval (PHI) Card */}
      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6 text-xs sm:text-sm shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">⚠️</span>
          <h3 className="font-bold text-sm sm:text-base text-ink">
            কীটনাশক ব্যবহারের সতর্কতা ও প্রি-হার্ভেস্ট বিরতি (PHI)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-ink-2">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-ink text-xs sm:text-sm">স্প্রে করার পূর্বসতর্কতা:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>বাতাসের অনুকূলে স্প্রে করুন, বাতাসের বিপরীত দিকে কখনো স্প্রে করবেন না।</li>
              <li>স্প্রে করার সময় মাস্ক, গ্লাভস ও উপযুক্ত পোশাক পরিধান করুন।</li>
              <li>তীব্র রোদে বা বৃষ্টির ঠিক আগে স্প্রে না করে সকাল বা শেষ বিকেলে করুন।</li>
            </ul>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-semibold text-ink text-xs sm:text-sm">ফসল তোলার সময়সীমা (PHI):</h4>
            <ul className="space-y-1 list-disc list-inside">
              {agronomy.safetyPrecautions.map((safe, idx) => (
                <li key={idx} className="font-medium text-ink">
                  {safe}
                </li>
              ))}
              <li>কীটনাশক প্রয়োগের পর খালি পাত্রটি নিরাপদ জায়গায় মাটিতে পুঁতে ফেলুন।</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
