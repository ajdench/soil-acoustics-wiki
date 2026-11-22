---
type: "Workflow Guide"
title: "Standard proposals"
description: "Durable consumer-to-Standard proposal workflow for Soil Acoustics."
status: "draft"
---

# Standard proposals

Potentially reusable improvements remain owned by `Soil Acoustics`. Each proposal has one canonical, schema-valid JSON record under `standard-proposals/`. Generated previews under `output/standard-proposals/` are ignored and disposable.

## Changes proposed from this wiki

| Proposed change | What the released checks missed | Acceptance test |
| --- | --- | --- |
| Search contrast against the header (`header-search-boundary`) | A legible label could pass even when the button fill blended into the header. | Require either a fill or a continuous perimeter with 3:1 contrast against the adjacent header. Measure the visible control at rest, on hover and at keyboard focus in both palettes. Keep the separate keyboard focus check. |
| Equal insets around the governing question (`governing-question-insets`) | The marker and rail passed with 12 pixels on the left and zero padding on the other sides. | Measure equal, positive space from each inside border to the paragraph box. Test the wrapped mobile question and a desktop question. A missing inset or a paragraph margin that changes the spacing must fail. |

The two proposal records are prepared for review. Submission and adoption are pending. The selection colour in the navigation is a project design choice documented in `DESIGN.md`.

## Local workflow

1. Complete, verify, and commit the implementation in its own JJ phase.
2. Record the full Git commit, optional JJ change ID, and immutable pinned Standard revision.
3. Create and complete a proposal with `npm run standard:proposal -- new <slug>`.
4. Validate offline with `check <id>` or `check --all`, including direct-state metadata, prerequisites, ordering, and terminal workflow-v1 transitions.
5. Generate a scrubbed preview with `prepare <id>` and inspect it with `show <id>`.
6. Bind approval to the exact payload digest and governed form revision.
7. Run `open <id>` only when requested. It may check and open the form, but the user performs the final Submit action.

Do not include consumer files, secrets, private absolute paths, personal or confidential data, restricted evidence, public vulnerability detail, or material the project lacks authority to share.

## Separate authority

The tracked workflow distinguishes local verification, payload approval/submission, explicit Standard classification and decision, immutable release inclusion, and optional adoption back into this project. Record each transition in its own JJ phase. Directly edited records must satisfy the same invariants as command-produced records, and issue linkage, decision, release inclusion, and adoption are terminal workflow-v1 transitions. Issue closure is not acceptance; acceptance is not release; and release does not change `.wiki-standard.yaml`, conformance status, deviations, or the pinned revision automatically.

Release evidence requires the registry bytes at the exact full recorded revision, proof that it strictly descends from the release revision, a matching public release with the exact tag, `draft: false`, and `immutable: true`, and tag resolution to the recorded release revision. Never use `pre-registry-local-history`: workflow v1 reserves it for one exact existing UK Digital Health `DKBWS-LINK-002` Standard-registry entry, not consumer work.

If the form, required label, marker search, provenance, exact digest, or remote result is missing, changed, duplicated, or ambiguous, stop with the durable local record. Never substitute an automated issue write or attachment upload.
