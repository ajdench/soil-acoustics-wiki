import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { losslessExport } from "./okf-core.mjs";

const read = (file) => readFileSync(file, "utf8");
const manifest = parse(read(".wiki-standard.yaml"));
const release = JSON.parse(read("config/standard-release.json"));
const { stack } = release;
assert.equal(release.selection, "latest-verified-immutable");
assert.equal(stack.release.immutable, true);
assert.equal(stack.release.draft, false);
assert.equal(release.source, manifest.standard.source);
assert.equal(stack.release.tag, stack.tag);
assert.equal(stack.qualification.workflowPath, ".github/workflows/verify.yml");
assert.equal(stack.qualification.status, "completed");
assert.equal(stack.qualificationScope, "dated-release-verification");
assert.equal(stack.revision, manifest.standard.revision);
assert.equal(stack.tag, manifest.capabilities.standard_release_tag);
assert.equal(stack.qualification.headSha, stack.revision);
assert.equal(stack.qualification.headBranch, "main");
assert.equal(stack.qualification.event, "push");
assert.equal(stack.qualification.conclusion, "success");
const projectName = JSON.parse(read("package.json")).name;
for (const name of ["package-lock.json", "uv.lock", ".node-version", ".python-version"]) {
  const record = stack.files.find((f) => f.path === name);
  // A local package has its own name and licensing decision. Reconstruct only
  // the upstream package identity before checking the entire dependency graph.
  let released = read(name);
  if (name === "uv.lock") {
    released = released.replace('name = "' + projectName + '"', 'name = "denchco-knowledge-base-wiki-standard"');
  }
  if (name === "package-lock.json") {
    const lock = JSON.parse(released);
    lock.name = "denchco-knowledge-base-wiki-standard";
    const local = lock.packages[""];
    lock.packages[""] = { name: lock.name, version: local.version, license: "MIT", ...local };
    lock.packages[""].name = lock.name;
    released = JSON.stringify(lock, null, 2) + "\n";
  }
  assert.equal(createHash("sha256").update(released).digest("hex"), record.sha256, name);
}
for (const location of Object.values(manifest.roles)) assert(existsSync(location), location);
const { exportData, report } = losslessExport({ target: ".", strict: true });
assert(exportData, JSON.stringify(report.diagnostics));
for (const bundle of exportData.bundles) {
  for (const file of bundle.files) {
    assert.equal(file.raw, read(path.join(bundle.root, file.path)), file.path);
  }
}
// The evidence matrix is the reader projection of maintained OKF records.
const files = exportData.bundles.flatMap((bundle) =>
  bundle.files.map((file) => ({ ...file, repoPath: path.join(bundle.root, file.path) })),
);
function recordsOfType(type, idPattern) {
  const result = new Map();
  for (const record of files.filter((item) => item.frontmatter?.type === type)) {
    const id = record.frontmatter["x-denchco"]?.id;
    assert.match(id ?? "", idPattern, record.repoPath);
    assert(!result.has(id), `Duplicate ${type} identity: ${id}`);
    result.set(id, record);
  }
  assert(result.size, `No canonical ${type} found`);
  return result;
}
function tableRows(source, header) {
  const lines = source.split(/\r?\n/);
  const index = lines.indexOf(header);
  assert(index >= 0, `Missing table header: ${header}`);
  const rows = [];
  for (const line of lines.slice(index + 2)) {
    if (!line.startsWith("|")) break;
    const cells = line.slice(1, -1).split(/(?<!\\)\|/).map((cell) => cell.trim());
    assert.equal(cells.length, 4, line);
    assert(cells.every(Boolean), `Empty cell in: ${line}`);
    rows.push(cells);
  }
  assert(rows.length > 0, `Empty table: ${header}`);
  return rows;
}
const sources = recordsOfType("Source record", /^SRC-\d{3,}$/);
const indexed = new Set();
for (const [id, authority] of tableRows(read(manifest.roles.source_register), "| ID | Authority | Role | Retrieved |")) {
  const record = sources.get(id);
  assert(record && !indexed.has(id), `Unrecognised or duplicate source register row: ${id}`);
  indexed.add(id);
  assert(authority.includes(`id="${id.toLowerCase()}"`), `Incorrect row anchor for ${id}`);
  assert(authority.includes(`[${record.frontmatter.title}](${record.frontmatter.resource})`), `Incorrect publication title or URL for ${id}`);
  assert.equal(record.frontmatter.sources?.[0]?.id, id, record.repoPath);
  assert.equal(record.frontmatter.sources[0].resource, record.frontmatter.resource, record.repoPath);
  const governance = record.frontmatter["x-denchco"];
  for (const field of ["retrieved", "source_type", "usage_basis", "confidentiality", "personal_data", "retention"]) {
    assert(governance[field]?.trim(), `${id} is missing ${field}`);
  }
}
assert.deepEqual(indexed, new Set(sources.keys()), "Source register and canonical records differ");

const claims = recordsOfType("Evidence record", /^EV-\d{3,}$/);
const titles = new Map([...claims.values()].map((record) => [record.frontmatter.title, record]));
assert.equal(titles.size, claims.size, "Evidence titles must be distinct in the reader matrix");
for (const [claimCell, references, state, limit] of tableRows(read(manifest.roles.evidence_matrix), "| Claim | Support | Evidence state | Limit |")) {
  const claim = /^\*\*(.+?)\.\*\*\s+(.+)$/.exec(claimCell);
  assert(claim, `Expected a titled claim and conclusion in: ${claimCell}`);
  const record = titles.get(claim[1]);
  assert(record, `Matrix claim lacks a unique canonical evidence record: ${claim[1]}`);
  titles.delete(claim[1]);
  assert.equal(claim[2], record.frontmatter.description, record.repoPath);
  assert.equal(state, record.frontmatter["x-denchco"].evidence_state, record.repoPath);
  assert(record.body.split(/\r?\n/).includes(`**Limit.** ${limit}`), `Matrix and record limitations differ: ${record.repoPath}`);
  const ids = record.frontmatter.sources.map((reference) => {
    const source = sources.get(reference.id);
    assert(source, `Unregistered evidence citation in ${record.repoPath}: ${reference.id}`);
    assert.equal(path.join(path.dirname(record.repoPath), reference.resource), source.repoPath, record.repoPath);
    return reference.id;
  });
  assert(ids.length > 0, `Missing evidence for ${record.repoPath}`);
  const links = [...references.matchAll(/\[(SRC-\d+)\]\(sources\.md#(src-\d+)\)/g)];
  for (const [, id, anchor] of links) assert.equal(id.toLowerCase(), anchor, id);
  assert.deepEqual(links.map((match) => match[1]), ids, `Matrix support differs for ${record.repoPath}`);
}
assert(!titles.size, `Missing matrix rows for ${[...titles.keys()].join(", ")}`);

const markdown = [];
function collectMarkdown(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory() && file !== "docs/assets") collectMarkdown(file);
    if (entry.isFile() && entry.name.endsWith(".md")) markdown.push(file);
  }
}
collectMarkdown("docs");
collectMarkdown(manifest.roles.okf_bundle);
const inbound = new Set([manifest.roles.human_wiki, path.join(manifest.roles.okf_bundle, "index.md")]);
for (const file of markdown) {
  const body = read(file).replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*/gm, "").replace(/`[^`\n]*`/g, "");
  for (const [, encoded] of body.matchAll(/!?\[[^\]\n]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+["'][^"']*["'])?\s*\)/g)) {
    const target = encoded.replace(/^<|>$/g, "").split(/[?#]/)[0];
    if (!target || /^[a-z][\w+.-]*:/i.test(target) || target.startsWith("//")) continue;
    const resolved = path.normalize(path.join(path.dirname(file), decodeURIComponent(target)));
    assert(existsSync(resolved), `Broken local link: ${file} → ${encoded}`);
    if (file !== resolved) inbound.add(resolved);
  }
}
for (const file of markdown) assert(inbound.has(file), `No contextual Markdown link to ${file}`);
for (const [file, terms] of [
  [manifest.roles.llm_wiki, [/ingest/i, /query/i, /lint/i, /evidence/i]],
  ["AGENTS.md", [/Question 1 of N/, /Jujutsu|JJ/, /canonical URL/i]],
  [manifest.roles.authoring_policy, [/80%/, /precision|meaning/i]],
  ["SECURITY.md", [/secret/i, /authori[sz]/i, /untrusted/i, /generated/i]],
  ["SOURCE_POLICY.md", [/personal/i, /confidential/i, /retention/i, /correction/i, /copyright/i]],
  ["LICENSING.md", [/third.party/i, /reuse|rights/i]],
]) {
  const content = read(file);
  for (const term of terms) assert(term.test(content), file + " lacks " + term);
}
console.log("Verified release provenance and locks, source records and receipts, matrix support and limitations, local links, portable source bytes, role mappings and governance policies.");
