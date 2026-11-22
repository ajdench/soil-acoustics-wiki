import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { losslessExport } from "./okf-core.mjs";
import { buildFullProfileReport } from "./full-profile-report.mjs";

test("portable export preserves unfamiliar metadata and the exact source text", () => {
  const target = mkdtempSync(path.join(tmpdir(), "soil-okf-"));
  try {
    const fixture = path.join(target, "knowledge");
    mkdirSync(fixture);
    writeFileSync(path.join(fixture, "index.md"), "---\nokf_version: \"0.2\"\n---\n# Index\n\n- [Field](field.md)\n");
    const raw = "---\ntype: Study\ntitle: Field\nproject_extension:\n  units: [dB, Hz]\n---\n# Field\n\nMeasurements.\n";
    writeFileSync(path.join(fixture, "field.md"), raw);
    const { report, exportData } = losslessExport({target: fixture});
    assert(exportData, JSON.stringify(report.diagnostics));
    const file = exportData.bundles[0].files.find((f) => f.path === "field.md");
    assert.deepEqual(file.frontmatter.project_extension, {units: ["dB", "Hz"]});
    assert.equal(file.raw, raw);
    assert.equal(readFileSync(path.join(fixture, "field.md"), "utf8"), raw);
  } finally { rmSync(target, {recursive:true, force:true}); }
});

test("a target with no recorded execution cannot pass full-profile conformance", () => {
  const now = new Date().toISOString();
  const receipt = {
    $schema: "https://denchco.github.io/knowledge-base-wiki-documentation/schema/verification-receipt-v1.json",
    receiptVersion:"1.0", target:process.cwd(), profile:"standard-production", evaluationDate:now.slice(0,10),
    startedAt:now, completedAt:now, environment:{ runtime:"node",runtimeVersion:process.version,platform:process.platform,architecture:process.arch },
    gates:[], canonicalMutation:{status:"not-checked",changedPaths:[],reason:"No gate was run."}
  };
  const result = buildFullProfileReport({ target: ".", receipt });
  assert.equal(result.summary.profileComplete, false);
  assert(result.summary.notCheckedRequirements > 0);
});
