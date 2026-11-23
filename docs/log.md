---
type: "Research Log"
title: "Research and change log"
description: "Dated research and content changes for Soil Acoustics."
status: "stable"
---

# Research and change log

## 2026-11-23

The editorial review brought the [company history](company-and-product.md), the [field evidence](research-evidence.md) and the [choice of monitoring system](monitoring-systems.md) under one question on the [overview](index.md). The evidence and price checks are dated 22 November. The changes on 23 November concern how those findings are explained and presented.

## 2026-11-22

- Revised the [overview](index.md) to answer the owner’s questions about Soil Acoustics, its history, product, scientific evidence and competition. Added a visible Search border, equal padding around the governing question and a lighter green for the selected menu item.
- Traced the meter from hand-sorting earthworms to commercial subscriptions and the Newhouse Farm pilot. The [research review](research-evidence.md) compares the woodland and single-species findings. The [systems comparison](monitoring-systems.md) adds a pest detection field trial and a measured limit of manual earthworm counts.
- Checked the supplier’s wireworm classifier, reported database size and the Denton Reserve field comparison against the original accounts. The [company page](company-and-product.md) also identifies a planned trial that would pair meter recordings with soil-fauna sampling.
- Added the initial review of Soil Acoustics Ltd, its meter, the published operating guide and website. Checked funding, filing, subscription and data-use claims against their respective primary records.
- Compared research on soil fauna with the scope of the commercial score. Recorded weather, soil conditions and study design where they affect an acoustic result.
- Added the [monitoring systems comparison](monitoring-systems.md), covering commercially available systems and field trials. Recorded the public purchase or access route for each option.
- Migrated the local reader pages into the Standard Production structure and retained their existing routes. The [source register](sources.md), [evidence matrix](evidence-matrix.md) and [validation queue](validation-queue.md) track the supporting material and remaining questions.

## Original wiki and migration baseline

The initial four-page wiki passed a strict Zensical build and a localhost check. It had no DenchCo manifest, recorded Standard release, maintained source register, evidence matrix or LLM Wiki. The rc.17 inspector reported four errors and one warning on a copy of those original sources. The former setup did not meet the DenchCo standard.

The local history preserves that version at `882b83fe8d4e`. The migration targets `v0.1.0-rc.17` at `b781907eea212c4ddcbd64183997d0982d4caf40`. The release selector checked native immutability and the successful Verify run on that exact commit. The local URL and the original four reader routes carry forward. The comparison, records and agent guidance have their own routes. To recover the earlier layout for inspection, check out the baseline in a separate local working copy and use its README. Keep its preview on a separate port while this wiki is running.

To verify the migrated copy, run `npm run verify` in the wiki directory with the toolchain specified in the README. A completed run writes its observations to `output/verification/receipt.json` and the result for each Standard requirement to `output/verification/conformance-report.json`. These local files describe the wiki and its supporting records. The [evidence matrix](evidence-matrix.md) assesses the scientific and commercial claims.

## Public edition

The public repository `ajdench/soil-acoustics-wiki` begins with a source snapshot. The pre-migration history and the original screenshots remain in the local archive. The public website review links to the publisher’s pages. GitHub Actions builds the published wiki from the main branch, and the deployment record identifies the source commit. The repository README links to the live site. The local Standard Production receipt and the GitHub deployment have separate verification records.
