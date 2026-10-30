import type { Metadata } from "next";
import { CultivationDirectory } from "@/components/cultivation/CultivationDirectory";

export const metadata: Metadata = {
  title: "সকল ফসলের চাষাবাদ নির্দেশিকা — সবজি বাজার দর",
  description: "বাংলাদেশের সকল ফসলের আধুনিক চাষাবাদ পদ্ধতি, জমি প্রস্তুত, শতাংশ প্রতি সুষম সারের মাত্রা ও ফলন তোলার সময়সূচি।",
};

export default function CultivationPage() {
  return <CultivationDirectory />;
}
