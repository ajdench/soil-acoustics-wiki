import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { parse } from "yaml";
import { isDateTime, losslessExport } from "./okf-core.mjs";

const json = (file) => JSON.parse(readFileSync(file, "utf8"));
const ajv = new Ajv2020({ strict: false, allErrors: true });
ajv.addFormat("uri", { validate: (value) => URL.canParse(value) });
ajv.addFormat("date-time", { validate: isDateTime });
function check(schema, value) {
  const validate = ajv.compile(json("schema/" + schema + ".json"));
  assert(validate(value), schema + ": " + ajv.errorsText(validate.errors));
}
check("manifest-v1", parse(readFileSync(".wiki-standard.yaml", "utf8")));
check("standard-stack-report-v1", json("config/standard-release.json"));
const { report, exportData } = losslessExport({ target: ".", strict: true });
assert(exportData, JSON.stringify(report.diagnostics));
check("okf-export-v1", exportData);
for (const [file, schema] of [["receipt", "verification-receipt-v1"], ["conformance-report", "conformance-report-v1"]]) {
  const name = "output/verification/" + file + ".json";
  if (existsSync(name)) check(schema, json(name));
}
console.log("Validated manifest, pinned release evidence, complete OKF export and any generated verification artifacts.");
