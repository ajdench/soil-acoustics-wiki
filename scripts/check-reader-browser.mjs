import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { chromium, webkit } from "playwright";
import { reviewEvidenceMode, reviewExamples } from "./public-review.mjs";
import { checkQuestionInsets } from "./governing-question-insets.mjs";

const reviewMode = reviewEvidenceMode(process.cwd());

async function checkCurrentNavigation(page) {
  const current = page.locator('nav.md-nav--primary a[aria-current="page"]');
  assert.equal(await current.count(), 1);
  assert.equal(await current.evaluate(link => link.pathname), new URL(page.url()).pathname);
  // The renderer maintains one heading list for the sidebar and one for the drawer.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() => {
    const contents = [...document.querySelectorAll("nav.md-nav--secondary")];
    return contents.length > 0 && contents.every(nav => {
      const last = [...nav.querySelectorAll("a.md-nav__link")].at(-1);
      return last?.classList.contains("md-nav__link--active") && last.getAttribute("aria-current") === "location"
        && nav.querySelectorAll("[aria-current]").length === 1;
    });
  });
  for (const selected of await page.locator('nav a[aria-current]').all()) {
    const style = await selected.evaluate(link => {
      const s = getComputedStyle(link);
      return { leadingEdge: parseFloat(s.borderInlineStartWidth), shadow: s.boxShadow, weight: Number(s.fontWeight) };
    });
    assert.equal(style.leadingEdge, 0);
    assert.equal(style.shadow, "none");
    assert.ok(style.weight >= 700);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

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
        const question = page.locator("article blockquote.governing-question");
        const questionInsets = await checkQuestionInsets(question);
        await checkCurrentNavigation(page);
        // Replay the unpadded callout and independent right-edge/paragraph regressions.
        for (const defect of ["padding-block: 0", "padding-right: 0", "margin-top: 1em"]) {
          const selector = defect.startsWith("margin") ? "blockquote.governing-question > p" : "blockquote.governing-question";
          const override = await page.addStyleTag({ content: `${selector} { ${defect} !important; }` });
          try {
            await assert.rejects(() => checkQuestionInsets(question), /Question .* inset/);
          } finally {
            await override.evaluate(element => element.remove());
          }
        }
        await page.locator('article a[href*="monitoring-systems"]').first().click();
        await page.waitForURL("**/monitoring-systems/");
        const article = page.locator("article");
        await article.getByRole("heading", { name: /Comparing soil acoustic monitoring systems/ }).waitFor();
        await checkCurrentNavigation(page);
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
          engine: name, width, questionInsets, route: "/monitoring-systems/", sourceRow: href.split("#")[1], reviewMode,
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
