import { chromium } from "playwright";
import sharp from "sharp";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const html = readFileSync(resolve(__dirname, "favicon.html"), "utf-8");
const publicDir = resolve(__dirname, "../public");

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 512, height: 512 });
await page.setContent(html, { waitUntil: "networkidle" });

const source = await page.screenshot({ omitBackground: true, type: "png" });
await browser.close();

const sizes = [
  { file: "icon-512.png", size: 512 },
  { file: "icon-192.png", size: 192 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "favicon-32x32.png", size: 32 },
  { file: "favicon-16x16.png", size: 16 },
];

for (const { file, size } of sizes) {
  await sharp(source).resize(size, size).png().toFile(resolve(publicDir, file));
  console.log(`✓ public/${file}`);
}
