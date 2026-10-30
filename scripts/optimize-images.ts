import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CROPS_DIR = path.join(process.cwd(), "public", "crops");
const BLUR_DATA_FILE = path.join(process.cwd(), "src", "lib", "cropBlurData.json");

async function main() {
  if (!fs.existsSync(CROPS_DIR)) {
    console.error(`Directory not found: ${CROPS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(CROPS_DIR);
  const baseNames = new Set<string>();

  for (const f of files) {
    if (f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png") || f.endsWith(".webp")) {
      const name = f.replace(/\.(jpg|jpeg|png|webp)$/, "");
      baseNames.add(name);
    }
  }

  console.log(`Optimizing images for ${baseNames.size} crops in ${CROPS_DIR}...`);

  const blurMap: Record<string, string> = fs.existsSync(BLUR_DATA_FILE)
    ? JSON.parse(fs.readFileSync(BLUR_DATA_FILE, "utf-8"))
    : {};

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const name of baseNames) {
    // Look for best source file: webp or jpg
    const jpgPath = path.join(CROPS_DIR, `${name}.jpg`);
    const webpPath = path.join(CROPS_DIR, `${name}.webp`);
    const srcPath = fs.existsSync(webpPath) ? webpPath : jpgPath;

    if (!fs.existsSync(srcPath)) continue;

    const inputBuf = fs.readFileSync(srcPath);
    totalOriginal += inputBuf.length;

    // 1. WebP version (Max 640px, quality 80, effort 6)
    const webpBuf = await sharp(inputBuf)
      .resize(640, 640, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toBuffer();
    fs.writeFileSync(webpPath, webpBuf);
    totalOptimized += webpBuf.length;

    // 2. JPEG fallback (Max 640px, progressive mozjpeg)
    const jpgBuf = await sharp(inputBuf)
      .resize(640, 640, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(jpgPath, jpgBuf);

    // 3. Low-resolution Base64 Blur Preview (16px)
    const blurBuf = await sharp(inputBuf)
      .resize(16, 16, { fit: "cover" })
      .webp({ quality: 20 })
      .toBuffer();
    blurMap[name] = `data:image/webp;base64,${blurBuf.toString("base64")}`;

    console.log(`✓ ${name}: WebP ${Math.round(webpBuf.length / 1024)}KB | JPG ${Math.round(jpgBuf.length / 1024)}KB`);
  }

  fs.writeFileSync(BLUR_DATA_FILE, JSON.stringify(blurMap, null, 2), "utf-8");
  console.log(`\nAll done! Blur data saved to ${BLUR_DATA_FILE}`);
  console.log(`Original size: ${(totalOriginal / (1024 * 1024)).toFixed(2)} MB -> WebP: ${(totalOptimized / (1024 * 1024)).toFixed(2)} MB (${Math.round((1 - totalOptimized / totalOriginal) * 100)}% saved)`);
}

main().catch((err) => {
  console.error("Image optimization failed:", err);
  process.exit(1);
});
