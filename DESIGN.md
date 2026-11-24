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
| Selected navigation fill | `#dbead3` | `#333f2c` |
| Selected navigation text | `#365820` | `#b7dfa2` |
| Header control fill | `#d4e4cd` | `#d4e4cd` |
| Hovered header control fill | `#b5cda9` | `#b5cda9` |
| Pressed header control fill | `#9ab989` | `#9ab989` |
| Header control text and icons | `#21291d` | `#21291d` |
| Page | `#f8fbf7` | `#0f130e` |
| Body text | `#1f231d` | `#e8ede5` |
| Surface | `#ffffff` | `#1a1e19` |
| Muted text | `#525750` | `#b4b9b2` |
| Border | `#80857e` | `#838881` |
| Focus | `#365820` | `#b7dfa2` |
| Accent overlay | `rgb(64 99 43 / 10%)` | `rgb(164 204 143 / 10%)` |

All header controls use the same sage fill at rest. The hover and pointer-down fills use progressively stronger shades of the project accent. The three fills give 6.52:1, 5.07:1 and 4.00:1 contrast against the green header. Text and icons give 11.27:1, 8.77:1 and 6.91:1 against those fills. Keep the Search shortcut on the same surface as its label. Keyboard focus adds a 3px outer ring with a 3px gap.

The theme switch, Wide and Search share the same top and bottom edges, 1px perimeter and corner radius. A selected Wide label is bold. Its accessible name describes the next action and `aria-pressed` reports the saved choice. Use the same treatment for the drawer, theme and Search controls on small screens.

## Reader components

The header, navigation drawer and favicon use the same Soundwave SVG. Its seven rounded bars remain distinct at 16 pixels. The light strokes and green background match the header palette. [Bootstrap Icons Soundwave](https://icons.getbootstrap.com/icons/soundwave/)

Shared links use a 1200 × 630 illustration of a soil probe and a cream waveform. The artwork has no lettering. The caption and image description are supplied in the page’s Open Graph metadata so clients can display and announce them separately. Set the default caption and image in `project.extra.link_preview`. A page can use `social_title` or a `social_image` record with its own `path`, `alt`, `width`, `height` and `type`.

The current page and section use a soft green fill and bold type in both sidebars and the mobile menu. Keep the leading edge clear so active and inactive labels align. The label contrast is 6.50:1 in the light palette and 7.46:1 in the dark palette. Expose the current page and the current section to assistive technology. The section marker follows the renderer when the reader scrolls.

The marked `governing-question` block displays the subject question on the home page. Give its inline-start rail and text the active palette accent. Use one `.6rem` inset on all four sides, measured from the inner border edge to the paragraph box. The rail width is additional. Remove the paragraph margin so a wrapped question keeps the same inset above and below. Apply the same component to every verbatim repetition in its bounded reader set. Keep paraphrases, research quotations and source-register titles neutral.

Set prose to a maximum of 72ch in Standard and 84ch in Wide. Keep data tables, evidence screenshots and graphs free to use the full article width. On the overview, place the evidence review date below the title and give the governing question balanced line breaks.

Use the governed numeric superscript links for registered citations. Each has its own focus target, accessible full source identity and exact register anchor. Preserve leading zeroes. Source URLs and licences belong in the register.

Render routes with the pinned navigation override. Labels identify the destination. Lifecycle metadata belongs in the records. The shared header uses 1.6rem-high controls with .4rem rounding, square icon-only buttons, an unframed logo, and matching background and foreground state changes. Keep the theme control beside Wide and the native radio's checked state aligned with the active palette. Support focus, keyboard operation, zoom and mobile menu access.

The knowledge graph links representations of the same source corpus. Track evidence, ownership and uncertainty in text so the reader can interpret a relationship without relying on colour. Mermaid diagrams use ordinary rectangular nodes and native basis connectors unless their content requires a governed semantic role. Keep layouts free from overlapping nodes, clipped labels and page-level overflow.

## Verification

Run the qualified Chromium and WebKit header checks in both palettes. Exercise a source citation through to its register row, the governing question, the comparison table, the 2D and 3D graph views, mobile navigation and persistence of reader preferences. Record the actual test run in the verification receipt.
