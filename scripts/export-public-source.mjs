import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { preparePublicReview } from "./public-review.mjs";

const [directory, revision = "HEAD", ...extra] = process.argv.slice(2);
if (!directory || extra.length) throw new Error("Usage: node scripts/export-public-source.mjs NEW_DIRECTORY [REVISION]");
const target = path.resolve(directory);
const commit = execFileSync("git", ["rev-parse", "--verify", "--end-of-options", revision + "^{commit}"], { encoding: "utf8" }).trim();
const archive = execFileSync("git", ["archive", "--format=tar", commit], { maxBuffer: 128 * 1024 * 1024 });

// Start in a new directory so an export cannot overwrite an existing checkout.
mkdirSync(target);
try {
  execFileSync("tar", ["-xf", "-", "-C", target], { input: archive });
  await preparePublicReview(target);
} catch (error) {
  rmSync(target, { recursive: true, force: true });
  throw error;
}
console.log(`Exported public sources from ${commit} to ${target}.`);
