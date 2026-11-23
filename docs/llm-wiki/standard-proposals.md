---
type: "Workflow Guide"
title: "Standard proposals"
description: "Durable consumer-to-Standard proposal workflow for Soil Acoustics."
status: "draft"
---

# Standard proposals

This wiki has two proposals for improving the DenchCo Standard. The project has implemented and verified both changes locally. Approval to submit is pending, and neither has an upstream issue. The project has yet to consider adopting an upstream release for either change.

Each proposal has a tracked JSON record under `standard-proposals/`. Use that record for its current status. The workflow generates a disposable preview in `output/standard-proposals/`.

## Changes proposed from this wiki

| Proposed change | What the released checks missed | Acceptance test |
| --- | --- | --- |
| Search contrast against the header (`header-search-boundary`) | A legible label could pass even when the button fill blended into the header. | Require either a fill or a continuous perimeter with 3:1 contrast against the adjacent header. Measure the visible control at rest, on hover and at keyboard focus in both palettes. Keep the separate keyboard focus check. |
| Equal insets around the governing question (`governing-question-insets`) | The marker and rail passed with 12 pixels on the left and zero padding on the other sides. | Measure equal, positive space from each inside border to the paragraph box. Test the wrapped mobile question and a desktop question. A missing inset or a paragraph margin that changes the spacing must fail. |

The records identify the implementation commit and pinned Standard revision for each change. The navigation selection colour is a separate project design choice documented in `DESIGN.md`.

## Local workflow

1. Complete, verify, and commit the implementation in its own JJ phase.
2. Record the full Git commit, optional JJ change ID, and immutable pinned Standard revision.
3. Create and complete a proposal with `npm run standard:proposal -- new <slug>`.
4. Validate offline with `check <id>` or `check --all`, including direct-state metadata, prerequisites, ordering, and terminal workflow-v1 transitions.
5. Generate a scrubbed preview with `prepare <id>` and inspect it with `show <id>`.
6. Bind approval to the exact payload digest and governed form revision.
7. Run `open <id>` only when requested. It may check and open the form, but the user performs the final Submit action.

Do not include consumer files, secrets, private absolute paths, personal or confidential data, restricted evidence, public vulnerability detail, or material the project lacks authority to share.

## Who can change each status { #separate-authority }

Record each transition in its own Jujutsu phase. A direct edit to a record must meet the same conditions as a CLI change. In workflow v1, completed issue linkage, decision, release inclusion and adoption are terminal transitions.

| Stage | Evidence required |
| --- | --- |
| Local implementation | The project records its verified commit and pinned Standard revision. |
| Issue submission | The user submits the approved payload. Link the issue only after its marker and payload match unambiguously. |
| Standard decision | Record the explicit upstream classification and decision. Issue closure alone leaves acceptance unresolved. |
| Release inclusion | Obtain the registry bytes at the exact full revision. Verify that the registry revision strictly descends from the release revision. The public release must have the exact tag, `draft: false` and `immutable: true`. The tag must resolve to the recorded release revision. |
| Project adoption | The project can choose whether to adopt the released change. Record the authorised migration separately before changing its pin, conformance status or deviations. |

Workflow v1 reserves `pre-registry-local-history` for one existing UK Digital Health `DKBWS-LINK-002` Standard-registry entry. Consumer proposals may not use that exception.

If the form, label, marker search, provenance, exact digest or remote result is missing, changed, duplicated or ambiguous, stop and retain the local record. The CLI must never submit an issue or upload an attachment.
