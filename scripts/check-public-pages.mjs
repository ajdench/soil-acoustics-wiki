#!/usr/bin/env node
import assert from "node:assert/strict";
import { parseArgs } from "node:util";
import { chromium, webkit } from "playwright";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { "canonical-url": { type: "string" } },
});
assert.equal(positionals.length, 1,
  "Usage: node scripts/check-public-pages.mjs URL [--canonical-url PRODUCTION_URL]");

function baseUrl(value) {
  const url = new URL(value);
  assert(["http:", "https:"].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash,
    "Expected a public HTTP(S) base URL with no credentials, query, or fragment");
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

const base = baseUrl(positionals[0]);
const canonical = baseUrl(values["canonical-url"] ?? base.href);
const run = { endpoint: base.href, canonical: canonical.href, privateImages: [], browsers: [] };
const privateImages = ["homepage", "shop-collection", "plan-comparison", "portal", "narrow-menu"];
const publisherPages = [
  "https://soilacoustics.com/", "https://soilacoustics.com/buy-now/",
  "https://shop.soilacoustics.com/collections/frontpage", "https://portal.soilacoustics.com/login",
];

function projectPath(url) {
  assert.equal(url.origin, canonical.origin, `Unexpected canonical origin in ${url.href}`);
  assert(url.pathname.startsWith(canonical.pathname), `Outside the published path: ${url.href}`);
  return url.pathname.slice(canonical.pathname.length);
}

async function get(relative, expectedStatus = 200, finalPath = relative) {
  const url = new URL(relative, base);
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, expectedStatus, `${url.href} returned ${response.status}`);
  assert.equal(response.url, new URL(finalPath, base).href, `Unexpected redirect for ${url.href}`);
  return response;
}

await get("monitoring-systems", 200, "monitoring-systems/");
const robots = await (await get("robots.txt")).text();
assert(robots.split(/\r?\n/).some((line) => /^sitemap:\s*/i.test(line) &&
  line.replace(/^sitemap:\s*/i, "").trim() === new URL("sitemap.xml", canonical).href),
  "robots.txt must identify the absolute canonical sitemap URL");
const sitemap = await (await get("sitemap.xml")).text();
const sitemapPaths = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)]
  .map((match) => projectPath(new URL(match[1].replaceAll("&amp;", "&"))));
for (const route of ["", "monitoring-systems/", "website-review/", "sources/", "graph/two-dimensional/"]) {
  assert(sitemapPaths.includes(route), `Missing sitemap route: ${route}`);
}
run.sitemapEntries = sitemapPaths.length;

const discovery = await (await get("llms.txt")).text();
const alternates = [...discovery.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)]
  .map((match) => projectPath(new URL(match[1], canonical)));
for (const entry of ["index.md", "monitoring-systems/index.md", "sources/index.md"]) {
  assert(alternates.includes(entry), `Missing Markdown discovery link: ${entry}`);
}
for (const entry of new Set(alternates)) {
  const markdown = await (await get(entry)).text();
  assert(/^#\s+.+/m.test(markdown) && !/<html[\s>]/i.test(markdown), `Expected Markdown at ${entry}`);
}
const comparisonMarkdown = await (await get("monitoring-systems/index.md")).text();
assert(comparisonMarkdown.includes(new URL("sources/index.md#src-", canonical).href),
  "Markdown citations must resolve absolutely under the public project path");
const reviewMarkdown = await (await get("website-review/index.md")).text();
assert(!/assets\/review\//i.test(reviewMarkdown), "Public Markdown references private review assets");
for (const name of privateImages) {
  const route = `assets/review/${name}.png`;
  await get(route, 404);
  run.privateImages.push({ route, status: 404 });
}
run.discoveryLinks = alternates.length;

async function checkHead(page, route) {
  assert.equal(await page.locator('head link[rel="canonical"]').getAttribute("href"), new URL(route, canonical).href);
  assert.equal(await page.locator('head link[rel="alternate"][type="text/markdown"]').getAttribute("href"),
    new URL(route + "index.md", canonical).href);
  assert.equal(await page.locator('head link[rel="describedby"][type="text/plain"]').getAttribute("href"),
    new URL("llms.txt", canonical).href);
}

for (const [engine, browserType, width] of [["chromium", chromium, 1440], ["webkit", webkit, 390]]) {
  const browser = await browserType.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 600, hasTouch: width < 600 });
    page.setDefaultTimeout(30_000);
    const home = await page.goto(base.href);
    assert.equal(home?.status(), 200, base.href);
    await checkHead(page, "");
    await page.locator('article a[href*="monitoring-systems"]').first().click();
    await page.waitForURL(new URL("monitoring-systems/", base).href);
    // Instant navigation updates the address before replacing the article and its metadata.
    await page.getByRole("heading", { name: "Comparing soil acoustic monitoring systems" }).waitFor();
    await checkHead(page, "monitoring-systems/");
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `Comparison overflows the ${width}px viewport`);
    const citation = page.locator('article sup a[href*="sources/#src-"], article a[href*="sources/#src-"]:has(sup)').first();
    const target = new URL(await citation.getAttribute("href"), page.url());
    assert.match(target.hash, /^#src-\d+$/);
    assert.equal(target.origin + target.pathname, new URL("sources/", base).href);
    await citation.click();
    await page.waitForURL(target.href);
    const sourceRow = page.locator("tr").filter({ has: page.locator(target.hash) });
    await sourceRow.locator('a[href^="https://"]').first().waitFor();
    await checkHead(page, "sources/");

    await page.goto(new URL("website-review/", base).href);
    await checkHead(page, "website-review/");
    assert.equal(await page.locator('article [src*="assets/review/"], article [href*="assets/review/"]').count(), 0);
    const publishers = await page.locator('article a[href^="https://"]').evaluateAll((links) => links.map((link) => link.href));
    for (const original of publisherPages) {
      assert(publishers.includes(original), `Review must link to the original publisher page: ${original}`);
    }

    await page.goto(new URL("graph/", base).href);
    const graphUrl = new URL("assets/graphify/graph.json", base).href;
    const [graph] = await Promise.all([
      page.waitForResponse((response) => response.url() === graphUrl && response.ok()),
      page.getByRole("link", { name: "2D", exact: true }).click(),
    ]);
    await page.waitForURL(new URL("graph/two-dimensional/", base).href);
    const dataset = await graph.json();
    assert(dataset.nodes?.length && (dataset.links ?? dataset.edges)?.length, "Expected a populated graph");
    const frame = page.locator("iframe.graph-frame");
    await frame.scrollIntoViewIfNeeded();
    assert.equal(new URL(await frame.getAttribute("src"), page.url()).href, new URL("assets/graphify/graph.html", base).href);
    await page.frameLocator("iframe.graph-frame").locator("canvas").first().waitFor({ state: "visible" });
    run.browsers.push({ engine, width, sourceRow: target.hash.slice(1), publisherLinks: publisherPages.length, graphNodes: dataset.nodes.length });
  } finally {
    await browser.close();
  }
}

console.log(JSON.stringify(run, null, 2));
