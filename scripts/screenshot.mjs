// Dev utility: captures screenshots of key pages for visual review.
// Usage: node scripts/screenshot.mjs [baseUrl] (defaults to http://localhost:3000)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outDir = "/tmp/forge-shots";
mkdirSync(outDir, { recursive: true });

const targets = [
  { name: "landing", path: "/", fullPage: true },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
];

const browser = await chromium.launch();

for (const colorScheme of ["light", "dark"]) {
  for (const viewport of [
    { label: "desktop", width: 1440, height: 900 },
    { label: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    for (const target of targets) {
      await page.goto(baseUrl + target.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const file = `${outDir}/${target.name}-${colorScheme}-${viewport.label}.png`;
      await page.screenshot({ path: file, fullPage: target.fullPage ?? false });
      console.log("saved", file);
    }
    await context.close();
  }
}

await browser.close();
