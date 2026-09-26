import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.join(process.cwd(), "docs/pr-evidence/1626");
await mkdir(outputDir, { recursive: true });

const pages = [
  ["architecture", "Architecture", 1],
  ["orchestrator", "Orchestrator", 3],
  ["self-hosting", "Self-Hosting", 1],
  ["data-model", "Data Model", 1],
];
const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
];

const browser = await chromium.launch({ headless: true });
try {
  for (const [slug, title, expectedDiagrams] of pages) {
    for (const [device, viewport] of viewports) {
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({ viewport, colorScheme: theme, deviceScaleFactor: 1 });
        await context.addInitScript(() => {
          localStorage.setItem("cookie_consent", "rejected");
          localStorage.setItem("offer-hub-cta-dismissed", Date.now().toString());
        });
        const page = await context.newPage();
        await page.goto(`http://localhost:3000/docs/guide/${slug}`, { waitUntil: "networkidle" });
        await page.getByRole("heading", { name: title, level: 1 }).waitFor({ state: "visible" });

        const canvases = page.locator(".mermaid-diagram-canvas");
        const count = await canvases.count();
        if (count !== expectedDiagrams) {
          throw new Error(`${slug}: expected ${expectedDiagrams} diagrams, found ${count}`);
        }
        await page.waitForFunction(
          () => {
            const canvases = [...document.querySelectorAll(".mermaid-diagram-canvas")];
            return canvases.length > 0 && canvases.every((canvas) => canvas.querySelector(".mermaid-svg-wrapper svg"));
          },
          null,
          { timeout: 60000 },
        );
        const hasDarkClass = await page.locator("html").evaluate((html) => html.classList.contains("dark"));
        if (hasDarkClass !== (theme === "dark")) {
          throw new Error(`${slug}: expected ${theme} theme, got ${hasDarkClass ? "dark" : "light"}`);
        }
        await page.screenshot({
          path: path.join(outputDir, `${slug}-${device}-${theme}.png`),
          fullPage: true,
          animations: "disabled",
        });
        console.log(`Captured ${slug} ${device} ${theme}: ${count} rendered diagrams`);
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
