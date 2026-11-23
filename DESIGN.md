---
version: "1.0"
name: "Soil Acoustics"
description: "Visual contract for the Soil Acoustics evidence review and monitoring systems comparison."
colors:
  primary: "#32541c"
  accent: "#40632b"
  background: "#f8fbf7"
  text: "#1f231d"
typography:
  body:
    fontFamily: "system-ui"
    fontSize: "1rem"
    lineHeight: "1.6"
rounded:
  control: ".4rem"
spacing:
  control: ".4rem"
components:
  reader-surface:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
  header-brand:
    backgroundColor: "{colors.primary}"
  governing-question:
    textColor: "{colors.accent}"
---

# Design contract

A land manager entering the wiki can follow the overview to a field interpretation, a review of the product claims or a comparison of monitoring equipment. Keep comparison tables readable at desktop width. On a narrow screen, keep horizontal table scrolling inside the article. The research screenshots preserve the website as observed. Their colours and controls belong to the screenshot evidence.

## Appearance and contrast

The project owner selected the exact brand seed `#32541c` on 22 November 2026. New readers start with the light palette and wide desktop layout. The reader may switch between dark and light or Standard and Wide. Preserve those preferences across reloads and navigation. On narrow screens, hide the width switch and retain its desktop setting.

The appearance generator derives contrast-adjusted colours for each surface from `config/wiki-appearance.json`. Renderer, Mermaid and both graph views use the matching generated roles. The full token manifest is `docs/assets/appearance/tokens.json`. The roles below support the reading and navigation paths.

| Role | Light | Dark |
| --- | --- | --- |
| Brand | `#32541c` | `#32541c` |
| Brand text | `#f7f9f5` | `#f7f9f5` |
| Primary | `#40632b` | `#caf3b5` |
| Active link and question | `#40632b` | `#a4cc8f` |
| Visited link | `#496c34` | `#b1d99b` |
| Light accent surface | `#ebf6e5` | `#262e22` |
| Selected navigation fill | `#ebf6e5` | `#262e22` |
| Selected navigation text | `#365820` | `#b7dfa2` |
| Page | `#f8fbf7` | `#0f130e` |
| Body text | `#1f231d` | `#e8ede5` |
| Surface | `#ffffff` | `#1a1e19` |
| Muted text | `#525750` | `#b4b9b2` |
| Border | `#80857e` | `#838881` |
| Focus | `#365820` | `#b7dfa2` |
| Hover | `#aaa08d` | `#948774` |
| Hover text | `#29251f` | `#201c17` |
| Accent overlay | `rgb(64 99 43 / 10%)` | `rgb(164 204 143 / 10%)` |

Measure 4.5:1 or better for normal text and 3:1 or better for interactive boundaries and focus on their actual backgrounds. The closed Search control has a visible perimeter against the adjacent header at rest, on hover and on keyboard focus. Check the label and shortcut against the control fill separately. Check the compact Search icon and keyboard focus in both appearances.

## Reader components

The rc.17 reference adapter uses the exact brand seed as the selected menu fill. The owner requested a lighter selection so an active link has less visual weight than the site header. The local adapter uses a soft accent fill, bold text and a 3px leading rail for the current page and section, including in the mobile menu. Its local fixture checks these roles. The header retains the exact brand seed.

The marked `governing-question` block displays the subject question on the home page. Give its inline-start rail and text the active palette accent. Use one `.6rem` inset on all four sides, measured from the inner border edge to the paragraph box. The rail width is additional. Remove the paragraph margin so a wrapped question keeps the same inset above and below. Apply the same component to every verbatim repetition in its bounded reader set. Keep paraphrases, research quotations and source-register titles neutral.

Set prose to a maximum of 72ch in Standard and 84ch in Wide. Keep data tables, evidence screenshots and graphs free to use the full article width. On the overview, place the evidence review date below the title and give the governing question balanced line breaks.

Use the governed numeric superscript links for registered citations. Each has its own focus target, accessible full source identity and exact register anchor. Preserve leading zeroes. Source URLs and licences belong in the register.

Render routes with the pinned navigation override. Labels identify the destination. Lifecycle metadata belongs in the records. The shared header uses 1.6rem-high controls with .4rem rounding, square icon-only buttons, an unframed logo, and matching background and foreground state changes. Keep the theme control beside Wide and the native radio's checked state aligned with the active palette. Support focus, keyboard operation, zoom and mobile menu access.

The knowledge graph links representations of the same source corpus. Track evidence, ownership and uncertainty in text so the reader can interpret a relationship without relying on colour. Mermaid diagrams use ordinary rectangular nodes and native basis connectors unless their content requires a governed semantic role. Keep layouts free from overlapping nodes, clipped labels and page-level overflow.

## Verification

Run the qualified Chromium and WebKit header checks in both palettes. Exercise a source citation through to its register row, the governing question, the comparison table, the 2D and 3D graph views, mobile navigation and persistence of reader preferences. Record the actual test run in the verification receipt.
