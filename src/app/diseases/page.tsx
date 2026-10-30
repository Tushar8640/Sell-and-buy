import type { Metadata } from "next";
import { DiseaseDirectory } from "@/components/diseases/DiseaseDirectory";

export const metadata: Metadata = {
  title: "সকল ফসলের রোগবালাই ও বালাইনাশক সহায়িকা — সবজি বাজার দর",
  description: "বাংলাদেশের ফসলের রোগবালাই নির্ণয়, জৈব নিরাময় এবং অনুমোদিত ওষুধ ও কীটনাশকের বাণিজ্যিক ব্র্যান্ড ও মাত্রা।",
};

export default function DiseasesPage() {
  return <DiseaseDirectory />;
}
