import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { chromium, webkit } from "playwright";
import { reviewEvidenceMode, reviewExamples } from "./public-review.mjs";

const reviewMode = reviewEvidenceMode(process.cwd());

const server = spawn(process.execPath, ["scripts/serve-built-site.mjs"], {
  env: { ...process.env, HOST: "127.0.0.1", PORT: "0", SITE_DIR: "site" },
  stdio: ["ignore", "pipe", "inherit"],
});
const output = "output/verification/readers";
mkdirSync(output, { recursive: true });
const checks = [];
try {
  const lines = createInterface({ input: server.stdout });
  const [line] = await Promise.race([
    once(lines, "line"),
    once(server, "exit").then(([code]) => { throw new Error("Built-site server stopped: " + code); }),
  ]);
  const { url } = JSON.parse(line);
  for (const [name, engine] of [["chromium", chromium], ["webkit", webkit]]) {
    const browser = await engine.launch();
    try {
      for (const width of [1440, 390]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const start = await page.goto(url);
        assert.equal(start.status(), 200);
        await page.locator('article a[href*="monitoring-systems"]').first().click();
        await page.waitForURL("**/monitoring-systems/");
        const article = page.locator("article");
        await article.getByRole("heading", { name: /Comparing soil acoustic monitoring systems/ }).waitFor();
        const body = await article.innerText();
        for (const product of ["Biofonic", "ALISO", "BAR-LT", "AudioMoth", "JrF", "SAQI"]) assert(body.includes(product), product);
        const reference = article.locator('a[href*="sources/#src-"]').first();
        const href = await reference.getAttribute("href");
        assert(href?.includes("#src-"));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.screenshot({ path: output + "/" + name + "-" + width + ".png" });
        await reference.click();
        await page.waitForFunction(() => location.hash.startsWith("#src-") && document.querySelector(location.hash)?.closest("tr"));
        await page.goto(new URL("website-review/", url).href);
        const images = page.locator("article img");
        if (reviewMode === "screenshots") {
          assert.equal(await images.count(), reviewExamples.length);
          for (const { file } of reviewExamples) {
            const picture = page.locator('article img[src$="/' + file + '"]');
            assert.equal(await picture.count(), 1, file);
            await picture.scrollIntoViewIfNeeded();
            assert(await picture.evaluate(async (img) => { await img.decode(); return img.naturalWidth > 0 && Boolean(img.alt); }));
          }
        } else {
          assert.equal(await images.count(), 0);
          for (const { label, url } of reviewExamples) {
            const link = article.getByRole("link", { name: label, exact: true });
            assert.equal(await link.count(), 1, label);
            assert.equal(await link.getAttribute("href"), url, label);
          }
        }
        checks.push({
          engine: name, width, route: "/monitoring-systems/", sourceRow: href.split("#")[1], reviewMode,
          reviewImages: reviewMode === "screenshots" ? reviewExamples.length : 0,
          reviewPublisherLinks: reviewMode === "publisher-links" ? reviewExamples.length : 0,
        });
        await page.close();
      }
    } finally { await browser.close(); }
  }
  writeFileSync(output + "/journeys.json", JSON.stringify(checks, null, 2) + "\n");
  console.log("Verified comparison discovery, source-row navigation and five review examples (" + reviewMode + ") in four browser/viewport combinations.");
} finally { server.kill("SIGTERM"); }
