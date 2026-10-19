// Canonical list of crops tracked by the app, and how each source names them.
// Add a crop here and both the collector and the UI pick it up.

export type CropGroup = "vegetable" | "leafy" | "tuber" | "spice";

export interface Crop {
  id: string;
  en: string;
  bn: string;
  group: CropGroup;
  /** Unit every price for this crop is normalised to. */
  unit: "kg" | "piece";
  /** Exact commodity names in the WFP/HDX Bangladesh food prices CSV. */
  wfp?: string[];
  /** Name prefixes of the product in TCB daily retail price sheets, compared via normaliseBn. */
  tcb?: string[];
  /** Extra Bengali names used by some sources (crop.bn and tcb names are always tried too). */
  aliases?: string[];
  /** Commodity ids in the DAM price system (moa-services.com agri-service). Variants are kept apart via PriceRecord.variant. */
  dam?: number[];
}

export const CROPS: Crop[] = [
  { id: "potato", en: "Potato", bn: "আলু", group: "tuber", unit: "kg", wfp: ["Potatoes (Holland, white)"], tcb: ["আলু"], dam: [942, 943, 944, 945, 946, 947] },
  { id: "sweet-potato", en: "Sweet potato", bn: "মিষ্টি আলু", group: "tuber", unit: "kg", dam: [948] },
  { id: "mukhi-kochu", en: "Taro (mukhi kochu)", bn: "মুখি কচু", group: "tuber", unit: "kg", dam: [960] },
  { id: "onion-local", en: "Onion (local)", bn: "পেঁয়াজ (দেশি)", group: "spice", unit: "kg", tcb: ["পিয়াজ (দেশি)", "পেয়াজ (দেশি)"], dam: [831, 833] },
  { id: "onion-imported", en: "Onion (imported)", bn: "পেঁয়াজ (আমদানি)", group: "spice", unit: "kg", wfp: ["Onions (imported, India)", "Onions (imported, China)"], tcb: ["পিয়াজ (আমদানি)", "পেয়াজ (আমদানি)"], dam: [832] },
  { id: "garlic-local", en: "Garlic (local)", bn: "রসুন (দেশি)", group: "spice", unit: "kg", tcb: ["রসুন (দেশি)"], dam: [834] },
  { id: "garlic-imported", en: "Garlic (imported)", bn: "রসুন (আমদানি)", group: "spice", unit: "kg", wfp: ["Garlic (imported, China)"], tcb: ["রসুন (আমদানি)"], dam: [836] },
  { id: "ginger-local", en: "Ginger (local)", bn: "আদা (দেশি)", group: "spice", unit: "kg", wfp: ["Ginger (local)"], tcb: ["আদা (দেশি)"], dam: [838, 839] },
  { id: "ginger-imported", en: "Ginger (imported)", bn: "আদা (আমদানি)", group: "spice", unit: "kg", wfp: ["Ginger (imported)"], tcb: ["আদা (আমদানি)"], dam: [840] },
  { id: "turmeric-local", en: "Turmeric (local)", bn: "হলুদ (দেশি)", group: "spice", unit: "kg", tcb: ["হলুদ (দেশি)"], dam: [644, 645, 647, 648] },
  { id: "dry-chilli-local", en: "Dry chilli (local)", bn: "শুকনা মরিচ (দেশি)", group: "spice", unit: "kg", tcb: ["শুকনা মরিচ (দেশি)"], dam: [643, 749], aliases: ["শুকনো মরিচ"] },
  { id: "green-chilli", en: "Green chilli", bn: "কাঁচা মরিচ", group: "vegetable", unit: "kg", wfp: ["Chili (green)"], tcb: ["কাঁচা মরিচ", "কাচামরিচ"], dam: [837] },
  { id: "eggplant", en: "Eggplant (brinjal)", bn: "বেগুন", group: "vegetable", unit: "kg", wfp: ["Eggplants"], tcb: ["বেগুন"], dam: [949, 950] },
  { id: "cucumber", en: "Cucumber", bn: "শসা", group: "vegetable", unit: "kg", wfp: ["Cucumber (short, khira)"], tcb: ["শসা"], dam: [975, 976, 977] },
  { id: "tomato", en: "Tomato", bn: "টমেটো", group: "vegetable", unit: "kg", wfp: ["Tomatoes (red)"], tcb: ["টমেটো"], dam: [981] },
  { id: "cabbage", en: "Cabbage", bn: "বাঁধাকপি", group: "vegetable", unit: "kg", wfp: ["Cabbage"], tcb: ["বাঁধাকপি"], dam: [969] },
  { id: "cauliflower", en: "Cauliflower", bn: "ফুলকপি", group: "vegetable", unit: "kg", wfp: ["Cauliflower"], tcb: ["ফুলকপি"], dam: [968] },
  { id: "kohlrabi", en: "Kohlrabi (olkopi)", bn: "ওলকপি", group: "vegetable", unit: "kg", dam: [970] },
  { id: "carrot", en: "Carrot", bn: "গাজর", group: "vegetable", unit: "kg", wfp: ["Carrots"], tcb: ["গাজর"], dam: [972] },
  { id: "radish", en: "Radish", bn: "মুলা", group: "vegetable", unit: "kg", dam: [988, 989], aliases: ["মূলা"] },
  { id: "turnip", en: "Turnip", bn: "শালগম", group: "vegetable", unit: "kg", dam: [971] },
  { id: "bitter-gourd", en: "Bitter gourd (korola)", bn: "করলা", group: "vegetable", unit: "kg", wfp: ["Gourd (bitter)"], tcb: ["করলা"], dam: [956], aliases: ["করল্লা"] },
  { id: "uchhe", en: "Small bitter gourd (uchhe)", bn: "উচ্ছে", group: "vegetable", unit: "kg", dam: [955] },
  { id: "bottle-gourd", en: "Bottle gourd", bn: "লাউ", group: "vegetable", unit: "kg", wfp: ["Gourd (bottle)"] },
  { id: "ash-gourd", en: "Ash gourd (chalkumra)", bn: "চালকুমড়া", group: "vegetable", unit: "piece", dam: [952] },
  { id: "snake-gourd", en: "Snake gourd", bn: "চিচিঙ্গা", group: "vegetable", unit: "kg", wfp: ["Snake gourd"], dam: [965], aliases: ["চিচিংগা"] },
  { id: "ridge-gourd", en: "Ridge gourd (jhinga)", bn: "ঝিঙা", group: "vegetable", unit: "kg", dam: [957] },
  { id: "sponge-gourd", en: "Sponge gourd (dhundul)", bn: "ধুন্দল", group: "vegetable", unit: "kg", dam: [966] },
  { id: "pointed-gourd", en: "Pointed gourd (potol)", bn: "পটল", group: "vegetable", unit: "kg", dam: [951] },
  { id: "spiny-gourd", en: "Spiny gourd (kakrol)", bn: "কাকরোল", group: "vegetable", unit: "kg", dam: [962] },
  { id: "pumpkin", en: "Pumpkin", bn: "মিষ্টি কুমড়া", group: "vegetable", unit: "kg", wfp: ["Pumpkin"], dam: [953] },
  { id: "okra", en: "Okra (dherosh)", bn: "ঢেঁড়স", group: "vegetable", unit: "kg", dam: [963] },
  { id: "bean", en: "Flat bean (shim)", bn: "শিম", group: "vegetable", unit: "kg", dam: [978, 979], aliases: ["শীম"] },
  { id: "yardlong-bean", en: "Yardlong bean (borboti)", bn: "বরবটি", group: "vegetable", unit: "kg", dam: [980] },
  { id: "peas", en: "Green peas", bn: "মটরশুঁটি", group: "vegetable", unit: "kg", dam: [964] },
  { id: "kochur-loti", en: "Taro stolon (kochur loti)", bn: "কচুর লতি", group: "vegetable", unit: "kg", dam: [974] },
  { id: "data", en: "Amaranth stem (data)", bn: "ডাটা", group: "vegetable", unit: "kg", dam: [967] },
  { id: "green-papaya", en: "Green papaya", bn: "কাঁচা পেঁপে", group: "vegetable", unit: "kg", wfp: ["Papaya (green)"], tcb: ["পেঁপে", "কাঁচা পেঁপে"], dam: [958] },
  { id: "green-banana", en: "Green banana", bn: "কাঁচা কলা", group: "vegetable", unit: "piece", wfp: ["Bananas (green)"], dam: [973] },
  { id: "lemon", en: "Lemon", bn: "লেবু", group: "vegetable", unit: "piece", wfp: ["Lemon (medium size)"], tcb: ["লেবু"] },
  { id: "malabar-spinach", en: "Malabar spinach", bn: "পুঁই শাক", group: "leafy", unit: "kg", wfp: ["Spinach (malabar)"], dam: [987] },
  { id: "red-spinach", en: "Red amaranth", bn: "লাল শাক", group: "leafy", unit: "kg", wfp: ["Spinach (red)"], dam: [985] },
  { id: "spinach", en: "Spinach (palong)", bn: "পালং শাক", group: "leafy", unit: "kg", dam: [986] },
  { id: "radish-greens", en: "Radish greens", bn: "মুলা শাক", group: "leafy", unit: "kg", dam: [984] },
];

/** Compare key for Bengali names: NFC, chandrabindu/spaces/brackets/hyphens dropped, long vowels folded to short. */
export function normaliseBn(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[ঁ\s()\-–]/g, "")
    .replace(/ী/g, "ি")
    .replace(/ূ/g, "ু");
}

const BN_PREFIXES = CROPS.flatMap((c) => [c.bn, ...(c.tcb ?? []), ...(c.aliases ?? [])].map((p) => ({ crop: c, key: normaliseBn(p) })));

/** Find the crop a Bengali product name refers to. The longest matching prefix wins ("মুলা শাক" over "মুলা"). */
export function matchBnName(name: string): Crop | undefined {
  const key = normaliseBn(name);
  let best: { crop: Crop; key: string } | undefined;
  for (const p of BN_PREFIXES) if (key.startsWith(p.key) && (!best || p.key.length > best.key.length)) best = p;
  return best?.crop;
}

/** TCB rows only map to crops that list TCB names, so a broad crop.bn can't swallow an unrelated row. */
export function matchTcbName(name: string): Crop | undefined {
  const crop = matchBnName(name);
  return crop?.tcb ? crop : undefined;
}

export const DIVISIONS = ["Barishal", "Chattogram", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet"] as const;

/** Label for prices averaged over the whole country. */
export const NATIONAL = "Bangladesh";

const DIVISION_ALIASES: Record<string, string> = { barisal: "Barishal", chittagong: "Chattogram", chattagram: "Chattogram" };

/** Map the spellings used by different sources onto DIVISIONS. */
export function canonicalDivision(name: string): string {
  const key = name.trim().toLowerCase();
  return DIVISION_ALIASES[key] ?? DIVISIONS.find((d) => d.toLowerCase() === key) ?? name.trim();
}

export const DIVISION_BN: Record<string, string> = {
  Barishal: "বরিশাল", Chattogram: "চট্টগ্রাম", Dhaka: "ঢাকা", Khulna: "খুলনা", Mymensingh: "ময়মনসিংহ",
  Rajshahi: "রাজশাহী", Rangpur: "রংপুর", Sylhet: "সিলেট", [NATIONAL]: "সারা দেশ",
};

export const CROP_BY_ID = new Map(CROPS.map((c) => [c.id, c]));

export const GROUP_LABELS: Record<CropGroup, string> = {
  vegetable: "সবজি",
  leafy: "শাক",
  tuber: "কন্দ",
  spice: "মসলা ফসল",
};

export const MONTHS_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
