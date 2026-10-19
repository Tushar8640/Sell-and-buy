import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CropDashboard } from "@/components/crop/CropDashboard";
import { Loading } from "@/components/Loading";
import { CROPS, CROP_BY_ID } from "@/lib/catalogue";
import { getCropAnalytics } from "@/lib/prices";

export function generateStaticParams() {
  return CROPS.map((c) => ({ id: c.id }));
}

export default function CropPage({ params, searchParams }: PageProps<"/crop/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <CropData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CropData({ params, searchParams }: PageProps<"/crop/[id]">) {
  const { id } = await params;
  const crop = CROP_BY_ID.get(id);
  if (!crop) notFound();
  const month = Number((await searchParams).month);
  const initial = (await getCropAnalytics(id))!;
  const options = CROPS.map((c) => ({ id: c.id, bn: c.bn, en: c.en }));
  return (
    <CropDashboard
      key={id}
      crop={crop}
      options={options}
      initial={initial}
      initialMonth={Number.isInteger(month) && month >= 1 && month <= 12 ? month : null}
    />
  );
}
