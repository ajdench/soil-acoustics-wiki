import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export const reviewExamples = [
  { file: "homepage.png", label: "Visit the Soil Acoustic Meter homepage", url: "https://soilacoustics.com/" },
  { file: "shop-collection.png", label: "View the meter and probe collection", url: "https://shop.soilacoustics.com/collections/frontpage" },
  { file: "plan-comparison.png", label: "Read the supplier’s plan comparison", url: "https://soilacoustics.com/buy-now/" },
  { file: "portal.png", label: "View the customer portal sign-in form", url: "https://portal.soilacoustics.com/login" },
  { file: "narrow-menu.png", label: "Open the homepage to inspect its responsive menu", url: "https://soilacoustics.com/" },
];
const publicBase = "https://ajdench.github.io/soil-acoustics-wiki/";
const noticeLink = (base) => "[Third-party software licence notices](" + new URL("assets/third-party-notices.txt", base).href + ")";
const reviewPath = "docs/website-review.md";
const imageDirectory = "docs/assets/review";
const read = (file) => readFileSync(file, "utf8");
const publicLink = ({ label, url }) => "[" + label + "](" + url + ")";

function evidenceForm(markdown, deploymentBase = publicBase) {
  const images = [...markdown.matchAll(/!\[[^\]\n]+\]\(assets\/review\/([^()\s]+)\)/g)];
  if (images.length) {
    assert.deepEqual(images.map((match) => match[1]).sort(), reviewExamples.map(({ file }) => file).sort(),
      "Expected the five reviewed captures, once each");
    assert(reviewExamples.every((item) => !markdown.includes(publicLink(item))), "Mixed public links and local captures");
    return "screenshots";
  }
  for (const item of reviewExamples) assert.equal(markdown.split(publicLink(item)).length, 2, "Missing or repeated " + item.label);
  assert(!markdown.includes("assets/review/"), "A local capture is still referenced");
  assert(markdown.includes(noticeLink(deploymentBase)) || markdown.includes(noticeLink(publicBase)), "Public review must link the software notices");
  return "publisher-links";
}

export function reviewEvidenceMode(root, deploymentBase = publicBase) {
  const mode = evidenceForm(read(path.join(root, reviewPath)), deploymentBase);
  const directory = path.join(root, imageDirectory);
  const files = existsSync(directory) ? readdirSync(directory).sort() : [];
  assert.deepEqual(files, mode === "screenshots" ? reviewExamples.map(({ file }) => file).sort() : [],
    "The review evidence must match its source files");
  return mode;
}

export function preparePublicReview(root, { deploymentBase = publicBase } = {}) {
  const review = path.join(root, reviewPath);
  const original = read(review);
  if (evidenceForm(original, deploymentBase) === "publisher-links") {
    const mode = reviewEvidenceMode(root, deploymentBase);
    const revised = original.replace(noticeLink(publicBase), noticeLink(deploymentBase));
    if (revised !== original) writeFileSync(review, revised);
    return mode;
  }
  assert(!existsSync(path.join(root, ".jj")), "Export the tracked tree to a staging directory before preparing public evidence");
  const directory = path.join(root, imageDirectory);
  const files = existsSync(directory) ? readdirSync(directory) : [];
  assert(files.every((name) => reviewExamples.some(({ file }) => name === file)), "Unrecognised review asset in staged copy");
  const revised = original.replace(/!\[[^\]\n]+\]\(assets\/review\/([^()\s]+)\)/g,
    (_, file) => publicLink(reviewExamples.find((item) => item.file === file)));
  writeFileSync(review, revised.trimEnd() + "\n\n" + noticeLink(deploymentBase) + "\n");
  const index = path.join(root, "docs/index.md");
  const home = read(index);
  writeFileSync(index, home.replace("[Website review with screenshots]", "[Website review and publisher pages]"));
  for (const name of files) rmSync(path.join(directory, name));
  if (existsSync(directory)) rmdirSync(directory);
  return reviewEvidenceMode(root, deploymentBase);
}

function packageNotices(directory, name) {
  const names = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^(?:licen[sc]e|copying|notice|third.party)(?:$|[. _-])/i.test(entry.name))
    .map((entry) => entry.name).sort();
  if (names.length) return names.map((file) => file + "\n" + read(path.join(directory, file)).trim()).join("\n\n");
  if (name === "fastdom") {
    const license = read(path.join(directory, "README.md")).split(/^## License\s*$/m)[1];
    assert(license?.includes("THE SOFTWARE IS PROVIDED"), "Missing the fastdom README licence");
    return license.trim();
  }
  throw new Error("Missing upstream licence text for " + name);
}

function graphDependencyDirectories(root, sbom) {
  const packages = new Set(sbom.components.map((item) => item["bom-ref"]).filter((ref) => ref.startsWith("node_modules/")));
  const lock = JSON.parse(read(path.join(root, "package-lock.json"))).packages;
  const visited = new Set();
  function add(ref) {
    if (visited.has(ref)) return;
    visited.add(ref);
    packages.add(ref);
    const pkg = lock[ref];
    const deps = { ...pkg.dependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies };
    for (const name of Object.keys(deps)) {
      let current = ref;
      for (;;) {
        const candidate = path.posix.join(current, "node_modules", name);
        if (lock[candidate] && existsSync(path.join(root, candidate, "package.json"))) {
          add(candidate);
          break;
        }
        if (!current) {
          assert(pkg.optionalDependencies?.[name] || pkg.peerDependenciesMeta?.[name]?.optional, "Missing dependency " + name + " for " + ref);
          break;
        }
        current = current.slice(0, Math.max(0, current.lastIndexOf("/node_modules/")));
      }
    }
  }
  for (const component of sbom.components) {
    if (component["bom-ref"].startsWith("node_modules/") && component.properties?.some((property) => property.name === "dkbws:dependency-coverage" && property.value.startsWith("opaque-upstream-prebundle"))) {
      add(component["bom-ref"]);
    }
  }
  return [...packages].sort();
}

export function writePublicRuntimeNotices(projectRoot, siteRoot) {
  const sbom = JSON.parse(read(path.join(projectRoot, "docs/assets/vendor/runtime-sbom.json")));
  const notices = [
    "Third-party software licence notices",
    "The runtime inventory is in assets/vendor/runtime-sbom.json. These notices cover its identified packages and the installed dependency trees of the two prebuilt graph libraries. The inventory identifies those prebuilt bundles by their upstream package. The template and renderer notices appear below.",
    "DenchCo Knowledge Base Wiki Standard\n" + read(path.join(projectRoot, "LICENSES/denchco-standard-MIT.txt")).trim(),
    "Lucide icons and Feather-derived icons, https://lucide.dev/license\n" + read(path.join(projectRoot, "LICENSES/lucide-icons.txt")).trim(),
  ];
  const version = read(path.join(projectRoot, ".python-version")).trim().split(".").slice(0, 2).join(".");
  const sitePackages = path.join(projectRoot, ".venv/lib/python" + version, "site-packages");
  for (const dist of ["zensical", "zensical_ui"]) {
    const versions = readdirSync(sitePackages).filter((name) => name.startsWith(dist + "-") && name.endsWith(".dist-info"));
    assert.equal(versions.length, 1, "Expected one installed version of " + dist);
    notices.push(versions[0].slice(0, -10) + "\n" + packageNotices(path.join(sitePackages, versions[0], "licenses"), dist));
  }
  for (const ref of graphDependencyDirectories(projectRoot, sbom)) {
    const directory = path.join(projectRoot, ref);
    const { name, version } = JSON.parse(read(path.join(directory, "package.json")));
    notices.push(name + " " + version + "\n" + packageNotices(directory, name));
  }
  const directory = path.join(siteRoot, "assets");
  mkdirSync(directory, { recursive: true });
  const target = path.join(directory, "third-party-notices.txt");
  writeFileSync(target, notices.join("\n\n" + "=".repeat(72) + "\n\n") + "\n");
  return target;
}
