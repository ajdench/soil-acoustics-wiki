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
const publisherLogo = "https://soilacoustics.com/wp-content/uploads/2025/04/Logo-Green-BG-scaled.jpg";
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

async function checkNavigationWaveform(page) {
  const favicon = await page.locator('head link[rel~="icon"]').evaluate(link => link.href);
  assert.equal(favicon, new URL("assets/soil-acoustics-waveform.png", base).href);
  for (const selector of [".md-header .md-logo img", ".md-nav__title .md-logo img"]) {
    assert.equal(await page.locator(selector).evaluate(image => image.src), favicon, selector);
  }
  const menu = page.locator('.md-header label[for="__drawer"]');
  const artwork = menu.locator('svg.wiki-menu-waveform[aria-hidden="true"]');
  assert.equal(await artwork.evaluate(icon => getComputedStyle(icon).backgroundImage), `url("${favicon}")`,
    "The menu button must use the favicon on direct and instant navigation");
}

async function checkFavicon(page) {
  const href = await page.locator('head link[rel~="icon"]').evaluate(link => link.href);
  assert.equal(href, new URL("assets/soil-acoustics-waveform.png", base).href);
  const samples = await page.evaluate(async href => {
    const image = new Image();
    image.src = href;
    await image.decode();
    const result = [];
    let source = image;
    // Halve progressively so narrow anti-aliased tips contribute to each smaller pixel.
    for (let size = 2 ** Math.floor(Math.log2(image.naturalWidth)); size >= 16; size /= 2) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const context = canvas.getContext("2d");
      context.drawImage(source, 0, 0, size, size);
      source = canvas;
      if (size > 64) continue;
      const { data } = context.getImageData(0, 0, size, size);
      // Red exceeds 60 at roughly 5% cream coverage over the solid green background.
      const isInk = (x, y) => data[4 * (y * size + x)] > 60;
      const axis = Array.from({ length: size }, (_, index) => index);
      const columns = axis.filter(x => axis.some(y => isInk(x, y)));
      const rows = axis.filter(y => axis.some(x => isInk(x, y)));
      const margins = [columns[0], size - 1 - columns.at(-1), rows[0], size - 1 - rows.at(-1)];
      const middle = axis.map(x => isInk(x, size / 2));
      const starts = axis.filter(x => middle[x] && !middle[x - 1]);
      const peak = columns.find(x => isInk(x, rows[0]));
      result.push({ size, margins, bars: starts.length, peak, peakBar: starts.filter(x => x <= peak).length });
    }
    return result;
  }, href);
  assert.deepEqual(samples.map(sample => sample.size), [64, 32, 16]);
  for (const { size, margins } of samples) {
    assert.deepEqual(margins, Array(4).fill(size / 16), `Incorrect waveform margins at ${size}px`);
  }
  const large = samples[0];
  assert.equal(large.bars, 8, "The reference waveform has eight separate bars");
  assert(large.peakBar === 4 && large.peak < large.size / 2, "The fourth bar peaks left of centre");
}

async function checkSocialPreviews(page) {
  const images = new Map();
  const descriptions = new Set();
  for (const route of sitemapPaths) {
    // A crawler uses the initial HTML response before the wiki runs any scripts.
    const html = await (await get(route)).text();
    const entries = await page.evaluate(raw => {
      const { head } = new DOMParser().parseFromString(raw, "text/html");
      return [...head.querySelectorAll('meta[property^="og:"], meta[name="twitter:card"], meta[name="description"]')]
        .map(tag => [tag.getAttribute("property") || tag.name, tag.content]);
    }, html);
    const tags = Object.fromEntries(entries);
    assert.equal(Object.keys(tags).length, entries.length, `Duplicate preview metadata on /${route}`);
    assert.equal(tags["og:url"], new URL(route, canonical).href);
    assert.equal(tags["og:type"], route ? "article" : "website");
    assert.equal(tags["og:site_name"], "Soil Acoustics");
    assert.equal(tags["twitter:card"], "summary_large_image");
    assert(tags["og:title"]?.trim() && tags.description?.trim());
    assert.equal(tags["og:description"], tags.description);
    descriptions.add(tags.description);
    const imageUrl = new URL(tags["og:image"]);
    const isProjectImage = imageUrl.href.startsWith(canonical.href);
    assert(isProjectImage || imageUrl.protocol === "https:", `External preview image must use HTTPS on /${route}`);
    assert(!imageUrl.username && !imageUrl.password && !imageUrl.hash);
    assert(!imageUrl.pathname.endsWith("/soil-acoustics-preview.jpg"), `Obsolete illustration on /${route}`);
    // Fetch project assets from the deployment under test and publisher assets from their declared origin.
    const imageSource = isProjectImage ? imageUrl.href.slice(canonical.href.length) : imageUrl.href;
    const image = { type: tags["og:image:type"], width: Number(tags["og:image:width"]), height: Number(tags["og:image:height"]) };
    assert(tags["og:image:alt"]?.trim() && image.width > 0 && image.height > 0);
    if (!route) {
      assert.equal(tags["og:title"], "What can soil sounds tell us?");
      assert.equal(imageUrl.href, publisherLogo);
    }
    if (imageUrl.href === publisherLogo) {
      assert.deepEqual(image, { type: "image/jpeg", width: 2560, height: 1359 });
      assert.match(tags["og:image:alt"], /soil acoustics/i);
      assert.match(tags["og:image:alt"], /green/i);
    }
    if (route === "graph/two-dimensional/") assert.equal(tags["og:title"], "2D knowledge graph");
    if (images.has(imageSource)) assert.deepEqual(image, images.get(imageSource));
    images.set(imageSource, image);
  }
  assert.equal(descriptions.size, sitemapPaths.length, "Each page needs its own preview description");
  for (const [path, image] of images) {
    const response = await get(path);
    assert.equal(response.headers.get("content-type")?.split(";")[0], image.type);
    const data = Buffer.from(await response.arrayBuffer()).toString("base64");
    const dimensions = await page.evaluate(async uri => {
      const picture = new Image();
      picture.src = uri;
      await picture.decode();
      return [picture.naturalWidth, picture.naturalHeight];
    }, `data:${image.type};base64,${data}`);
    assert.deepEqual(dimensions, [image.width, image.height], path);
  }
  run.socialPreviews = { pages: sitemapPaths.length, images: [...images.keys()] };
}

for (const [engine, browserType, width] of [["chromium", chromium, 1440], ["webkit", webkit, 390]]) {
  const browser = await browserType.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 600, hasTouch: width < 600 });
    if (engine === "chromium") await checkSocialPreviews(page);
    page.setDefaultTimeout(30_000);
    const home = await page.goto(base.href);
    assert.equal(home?.status(), 200, base.href);
    await checkHead(page, "");
    await checkFavicon(page);
    await checkNavigationWaveform(page);
    if (width < 600) {
      const menu = page.getByRole("button", { name: "Navigation", exact: true });
      await menu.press("Enter");
      await page.locator('.md-header [for="__drawer"][aria-expanded="true"]').waitFor();
      await page.locator(".md-nav__title .md-logo img").waitFor();
      await page.keyboard.press("Escape");
      await page.locator('.md-header [for="__drawer"][aria-expanded="false"]').waitFor();
      assert(await menu.evaluate(element => element === document.activeElement), "Closing the drawer returns focus to its button");
    }
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
    await checkNavigationWaveform(page);

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
