import { Suspense } from "react";
import type { Metadata } from "next";
import { getOverview } from "@/lib/prices";
import { Loading } from "@/components/Loading";
import { ProfitPlanner } from "@/components/planner/ProfitPlanner";

export const metadata: Metadata = {
  title: "লাভজনক রোপণ ও বিক্রয় ক্যালেন্ডার — সবজি বাজার দর",
  description: "কোন মাসে কোন ফসল রোপণ করলে ফসল তোলার সময়ে বাজারে সর্বোচ্চ দাম পাওয়া যাবে তার পূর্ণাঙ্গ কৃষি ও বাজার বিশ্লেষণ।",
};

export default function PlannerPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PlannerContent />
    </Suspense>
  );
}

async function PlannerContent() {
  const { rows } = await getOverview();

  const cropAverages: Record<string, { seasonal: (number | null)[]; seasonalPrices: (number | null)[] }> = {};
  for (const r of rows) {
    cropAverages[r.crop.id] = {
      seasonal: r.seasonal,
      seasonalPrices: r.seasonalPrices,
    };
  }

  return <ProfitPlanner cropAverages={cropAverages} />;
}
