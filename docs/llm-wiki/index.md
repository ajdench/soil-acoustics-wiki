---
type: "Agent Guide"
title: "LLM Wiki entry point"
description: "Minimum reliable context for maintaining Soil Acoustics."
status: "draft"
---

# LLM Wiki entry point

Use this guide to answer questions from the evidence and to maintain the wiki. Start a subject enquiry in the [reader overview](../index.md). Use the [context map](context-map.md) to choose the records for a particular task.

The maintained Markdown under `knowledge/` holds the source and evidence records. The [evidence matrix](../evidence-matrix.md) shows each claim with its limits. The [source register](../sources.md) identifies the original publication. A graph edge, rendered page or model response has no independent authority to establish a new finding.

## Read first

1. Read `AGENTS.md` and `.wiki-standard.yaml` for the repository instructions and the paths assigned to each role.
2. Read `knowledge/index.md`, then this guide, [project status](../project/status.md) and the [research log](../log.md).
3. Before writing original English prose, read the policy at `roles.authoring_policy` in the manifest. Use `AUTHORING.md` when the manifest gives no path.
4. For a rendered change, read `DESIGN.md`. When a current graph exists, query it to locate the records and check those records directly.

## Work with evidence { #operating-model }

| Operation | Action |
| --- | --- |
| Ingest a source | Register the publication and its identity. Add the exact register-row anchor, update the concept and evidence records, link the reader claim, and log the change. |
| Query a claim | Select the smallest set of records that answers the question. Name who made the observation and what it supports. Link each citation to its exact source row. |
| Lint an update | Check for contradictions, stale claims, unsupported authority and generated output that differs from its source. Check governing-question repetitions, register links, named-authority URLs and broken links. |
| Propose a Standard change | Verify and commit the project implementation before recording the proposal. Follow the [Standard proposal workflow](standard-proposals.md) for offline validation, payload review, approval and any later upstream decision. |

Apply the DenchCo ASD-STE100-inspired 80% house style to new prose. The percentage is a house-style aim. Preserve the source meaning, protected text, necessary terms and uncertainty. Document material exceptions in the authoring policy and follow explicit user instructions and stricter local rules. Applying the policy does not authorise bulk rewrites or a change of Standard pin.

## Verify and hand over

Use the [maintenance guide](maintenance.md) for the managed preview, source-link checks and release verification. In a Standard Production maintenance workspace, `DKBWS-PROV-001` requires a Jujutsu (JJ) commit for persistent changes before the turn ends.

Under `DKBWS-PROMPT-002`, development responses link to live Human or LLM Wiki pages using the configured canonical HTTP(S) origin. A plain repository path can identify an artifact without a Wiki route. For a managed local preview, `service:preview` checks all twelve registration fields, the installed and loaded job, the canonical URL and its identity marker. Distribution and CI leave the live `DKBWS-RUNTIME-002` check to the maintainer. Check captured response links with `--managed-live`, including Markdown, HTML and plain GFM links. `STD-VAL-007` covers the host's limit on checking uncaptured output.

## Choose follow-up work

Complete the requested scope first. At the end of every development cycle, assess the continuing subject, the governing question and content maturity. Prioritise subject content and evidence. Address any failed or unrun required check before optional content work.

Use [project status](../project/status.md), the [validation queue](../validation-queue.md) and relevant handoff evidence. Reopen parked or evidence-blocked work only for new evidence, a due recheck or explicit instruction. Record `blocked_by`, `reopen_when` and `last_checked`.

Give no more than three prioritised Next Steps. Each must fit one follow-up pass and specify `Proposed update:`, `Why it matters:` and `Done when:`. These are recommendations, not continuation authority. If none qualifies, write `No further grounded content update is available.` Use `response:next-steps:check` on captured drafts. The checker verifies format. A maintainer assesses grounding and eligibility.
