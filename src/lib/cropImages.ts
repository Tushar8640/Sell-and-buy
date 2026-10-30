// High-performance authentic photography for each crop stored locally in /crops/[id].webp (and .jpg fallback)
// Every crop has its own distinct, verified image without any duplicates.
import blurData from "./cropBlurData.json";

export const DEFAULT_CROP_IMAGE = "/crops/potato.webp";

export const CROP_IMAGES: Record<string, string> = {
  // Tubers (কন্দ)
  "potato": "/crops/potato.webp",
  "sweet-potato": "/crops/sweet-potato.webp",
  "mukhi-kochu": "/crops/mukhi-kochu.webp",

  // Spices (মসলা ফসল)
  "onion-local": "/crops/onion-local.webp",
  "onion-imported": "/crops/onion-imported.webp",
  "garlic-local": "/crops/garlic-local.webp",
  "garlic-imported": "/crops/garlic-imported-v2.webp",
  "ginger-local": "/crops/ginger-local.webp",
  "ginger-imported": "/crops/ginger-imported.webp",
  "turmeric-local": "/crops/turmeric-local.webp",
  "dry-chilli-local": "/crops/dry-chilli-local.webp",

  // Vegetables (সবজি)
  "green-chilli": "/crops/green-chilli.webp",
  "eggplant": "/crops/eggplant.webp",
  "cucumber": "/crops/cucumber.webp",
  "tomato": "/crops/tomato.webp",
  "cabbage": "/crops/cabbage.webp",
  "cauliflower": "/crops/cauliflower.webp",
  "kohlrabi": "/crops/kohlrabi.webp",
  "carrot": "/crops/carrot.webp",
  "radish": "/crops/radish.webp",
  "turnip": "/crops/turnip.webp",
  "bitter-gourd": "/crops/bitter-gourd.webp",
  "uchhe": "/crops/uchhe.webp",
  "bottle-gourd": "/crops/bottle-gourd.webp",
  "ash-gourd": "/crops/ash-gourd.webp",
  "snake-gourd": "/crops/snake-gourd.webp",
  "ridge-gourd": "/crops/ridge-gourd.webp",
  "sponge-gourd": "/crops/sponge-gourd.webp",
  "pointed-gourd": "/crops/pointed-gourd.webp",
  "spiny-gourd": "/crops/spiny-gourd.webp",
  "pumpkin": "/crops/pumpkin.webp",
  "okra": "/crops/okra.webp",
  "bean": "/crops/bean.webp",
  "yardlong-bean": "/crops/yardlong-bean.webp",
  "peas": "/crops/peas.webp",
  "kochur-loti": "/crops/kochur-loti.webp",
  "data": "/crops/data.webp",
  "green-papaya": "/crops/green-papaya.webp",
  "green-banana": "/crops/green-banana.webp",
  "lemon": "/crops/lemon.webp",

  // Leafy greens (শাক)
  "malabar-spinach": "/crops/malabar-spinach.webp",
  "red-spinach": "/crops/red-spinach.webp",
  "spinach": "/crops/spinach.webp",
  "radish-greens": "/crops/radish-greens.webp"
};

const BLUR_MAP = blurData as Record<string, string>;

export function getCropImage(cropId: string): string {
  return CROP_IMAGES[cropId] ?? `/crops/${cropId}.webp`;
}

export function getCropBlur(cropIdOrSrc?: string): string | undefined {
  if (!cropIdOrSrc) return BLUR_MAP["potato"];
  const cleanId = cropIdOrSrc
    .replace(/^.*\/crops\//, "")
    .replace(/\.(webp|jpg|jpeg|png)$/, "")
    .replace(/-v\d+$/, "");
  return BLUR_MAP[cleanId] ?? BLUR_MAP["potato"];
}
