import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { checkZensicalRuntime } from "./check-zensical-runtime.mjs";
import { prepareWikiAppearance } from "./prepare-wiki-appearance.mjs";
import { preparePublicReview, writePublicRuntimeNotices } from "./public-review.mjs";
import { publishLlms } from "./publish-llms.mjs";

const rawBase = process.env.PAGES_BASE_URL;
if (!rawBase) throw new Error("Set PAGES_BASE_URL to the public Pages site URL, including its project path.");
const base = new URL(rawBase);
if (base.protocol !== "https:" || base.username || base.password || base.hash || base.search) {
  throw new Error("PAGES_BASE_URL must be an absolute HTTPS URL without credentials, query, or fragment.");
}
if (!base.pathname.endsWith("/")) base.pathname += "/";

const root = process.cwd();
const output = path.join(root, "output");
mkdirSync(output, { recursive: true });
const stage = mkdtempSync(path.join(output, ".pages-"));
const renderedSite = path.join(stage, "site");
const publishedSite = path.join(output, "pages");
try {
  // Zensical resolves inputs, output and cache against the configuration's directory.
  // Render from a fresh project copy so public URLs never replace the managed local site.
  prepareWikiAppearance(root);
  for (const item of ["docs", "overrides", ".wiki-standard.yaml"]) {
    cpSync(path.join(root, item), path.join(stage, item), { recursive: true });
  }
  preparePublicReview(stage, { deploymentBase: base.href });
  const localConfig = readFileSync(path.join(root, "zensical.appearance.toml"), "utf8");
  const assignment = /^site_url\s*=.*$/gm;
  if (localConfig.match(assignment)?.length !== 1) throw new Error("Expected a single site_url in the appearance configuration.");
  const config = path.join(stage, "zensical.toml");
  writeFileSync(config, localConfig.replace(assignment, () => `site_url = ${JSON.stringify(base.href)}`));
  const pythonEnv = { ...process.env, PYTHONDONTWRITEBYTECODE: "1", PYTHONPATH: path.join(root, "scripts") };
  execFileSync("uv", ["run", "--no-sync", "zensical", "build", "--strict", "-f", config], { cwd: root, env: pythonEnv, stdio: "inherit" });
  const renderer = checkZensicalRuntime(renderedSite);
  const discovery = publishLlms(stage);
  if (discovery.baseUrl !== base.href) throw new Error(`Expected public canonical URL ${base.href}, found ${discovery.baseUrl}`);
  execFileSync("uv", ["run", "--no-sync", "python", "scripts/check_rendered_source_citations.py", "--root", stage, "--site", renderedSite], { cwd: root, env: pythonEnv, stdio: "inherit" });
  writePublicRuntimeNotices(root, renderedSite);
  writeFileSync(path.join(renderedSite, "robots.txt"), `User-agent: *
Allow: /
Sitemap: ${new URL("sitemap.xml", base).href}
`);
  writeFileSync(path.join(renderedSite, ".nojekyll"), "");
  execFileSync("uv", ["run", "--no-sync", "python", "scripts/check-pages.py", renderedSite, base.href], { cwd: root, env: pythonEnv, stdio: "inherit" });
  rmSync(publishedSite, { recursive: true, force: true });
  renameSync(renderedSite, publishedSite);
  console.log(`Published ${renderer.pages} HTML pages and ${discovery.pages.length} Markdown alternates to output/pages/ for ${base.href}`);
} finally {
  rmSync(stage, { recursive: true, force: true });
}
