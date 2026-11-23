---
type: "Maintenance Protocol"
title: "Maintenance"
description: "Bounded maintenance workflow for Soil Acoustics."
status: "draft"
---

# Maintenance

Start with the source of the change. A revised guide may affect the field procedure, the website review and a parked question. A change to the design can affect verification without changing what the research establishes.

## Correct a source or claim

1. Check the manifest, `AGENTS.md`, the relevant evidence and the current Git and Jujutsu state.
2. When a current Graphify graph exists, query it to locate related records. Read the canonical records before editing.
3. Read the policy at `roles.authoring_policy`, or `AUTHORING.md` if the manifest gives no path. Apply the DenchCo ASD-STE100-inspired 80% house style to new original English prose. Follow explicit instructions and stricter local policy.
4. Update the source, concept, evidence, links and logs together. Preserve source meaning, uncertainty, protected text, stronger verified local practice and unknown fields in the OKF knowledge bundle. Record the scope and reason for material style exceptions. The 80% aim carries no computed score or compliance claim.
5. Rebuild affected outputs and run every applicable check. Review the [source links](#reader-source-links) and [governing question](#canonical-governing-question) when reader pages change.
6. Review Git and Jujutsu state. In a Standard Production workspace, record all persistent changes from the turn in a Jujutsu commit before the turn ends. Record failed or unrun required checks in the commit and final response. A turn without persistent changes needs no empty commit.

## Hand over a persistent preview

1. Under the user-local lock, reload the shared register and check live listeners. Reserve the service ID and loopback endpoint atomically before changing the endpoint. Preserve other services.
2. Match all twelve registration fields. Verify the installed service definition and loaded job against the generated contract. Publish the identity marker.
3. Use `npm run service:preview` at the registered canonical URL. The handoff stops on an identity mismatch. Only the maintainer environment can supply this live-service evidence.

## Handle a reusable improvement

Keep the verified local implementation project-owned. Record the full Git revision, optional Jujutsu change ID and pinned Standard revision. The [Standard proposal workflow](standard-proposals.md) covers offline checks, payload preparation, the user's submission and each later transition.

The scrubbed payload must describe the problem, outcome, reuse class, affected contract, dependencies, fallback, bounded evidence, accessibility and browser effects, regression fixture and migration impact. Bind explicit approval to the exact payload and governed form digest. The CLI can open the checked form. Only the user can submit it. Proposal preparation has no effect on the Standard pin or migration authority.

## Development response navigation

- Resolve this Wiki's configured canonical URL from `capabilities.human_wiki_url` in `.wiki-standard.yaml` or its registered managed-preview endpoint. Before displaying a user-facing Human or LLM Wiki destination in a development response, verify that absolute HTTP(S) route against the live service.
- Do not substitute `file://` URLs, IDE or editor URLs, local-filesystem Markdown links, or repository-relative Markdown links for Wiki navigation. If the canonical service or route is unavailable, report that state rather than falling back to a file link.
- Use a plain repository path only to identify an implementation artifact that has no Wiki route, and never present that path as Wiki navigation.
- The checker covers Markdown destinations, entity-decoded HTML `a`/`area` links, and plain GFM-autolinked HTTP(S) text while excluding masked code/comments and images from navigation.
- When a draft response is captured, run `npm run response:links:check -- --base-url <canonical-url>` and add `--managed-live` for a managed local Wiki. That mode requires exact service status, canonical URL equality, and HTTP 200 for every displayed route. It cannot intercept a response the host never exposes, so `STD-VAL-007` remains in force.

## Reader source links

- Use numeric superscript citations whose numbers come from stable source identities, with leading zeroes and full accessible identities retained. Preserve explanatory notes and canonical Markdown.
- Add a stable anchor to every mapped source-register row. Link each visible source identity independently to its exact internal row; link every list member and only the displayed endpoints of a compact range.
- Use a registered primary URL when prose directly links a specifically named official authority, guidance, or publication. Do not add decorative links to generic institution names.
- Use any supplied source-link rewriter only as an optional reviewable aid. The required lint and browser checks reject bare or combined identities, wrong rows or fragments, unknown identities, unregistered named-authority URLs, inaccessible links, lost visible citation grammar, and broken destination journeys.

## Canonical governing question

- When one canonical governing question is declared, map its authoritative source and maintain a finite `reader_sources` set in the manifest capability contract.
- Run exact-text repetition lint after editing a bounded reader source. Every verbatim repetition uses the same governed callout; paraphrases, unrelated quotations, and historical/source records outside the bounded set remain ordinary content.
- Exercise every discovered repetition route in the built-output desktop/mobile browser contract. A subject-empty or question-free Wiki records `DKBWS-HUMAN-004` as not applicable and invents nothing.

## Select the next development task

Complete the requested work before making recommendations. At the end of every development cycle, assess the continuing subject, governing question and content maturity. Prioritise subject content and evidence. Address any failed or unrun required check before optional content work.

Check [project status](../project/status.md), the [validation queue](../validation-queue.md) and relevant handoff evidence. Keep completed items closed. A parked item can reopen for new evidence, a due recheck or an explicit instruction. Preserve its `blocked_by`, `reopen_when` and `last_checked` fields.

Give no more than three prioritised Next Steps, each suitable for one follow-up pass. Include `Proposed update:`, `Why it matters:` and `Done when:`. These are recommendations, not continuation authority. If no item qualifies, write `No further grounded content update is available.` Check captured drafts with `response:next-steps:check`. Review the evidence separately to confirm the recommendation is justified.

## Check the installed stack

For an explicit Standard update check, run `npm run standard:stack -- check . --json`. Keep the installed release tag and full revision unchanged while comparing the available release. The command makes read-only network requests and never installs, repins or migrates. If verification evidence is unavailable, report that state rather than calling the Wiki current.

An authorised update carries the reviewed tools, dependency locks, configuration and checks together. Preserve local content, deviations and unknown fields. Run complete target verification before recording adoption. First builds select the latest verified immutable release with `npm run standard:stack -- resolve --json`; a development commit is not an automatic fallback.
