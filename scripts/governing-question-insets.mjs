import assert from "node:assert/strict";

export async function checkQuestionInsets(callout) {
  const { insets, target } = await callout.evaluate(box => {
    const outer = box.getBoundingClientRect();
    const inner = box.querySelector(":scope > p").getBoundingClientRect();
    const style = getComputedStyle(box);
    // Measure to the paragraph's line box. Glyph ascenders and unused line width
    // vary with the text. Neither is part of the callout padding.
    return {
      insets: {
        top: inner.top - outer.top - parseFloat(style.borderTopWidth),
        right: outer.right - inner.right - parseFloat(style.borderRightWidth),
        bottom: outer.bottom - inner.bottom - parseFloat(style.borderBottomWidth),
        left: inner.left - outer.left - parseFloat(style.borderLeftWidth),
      },
      target: .6 * parseFloat(getComputedStyle(document.documentElement).fontSize),
    };
  });
  for (const [side, inset] of Object.entries(insets)) {
    assert(Math.abs(inset - target) <= .5, `Question ${side} inset is ${inset}px; expected ${target}px ± 0.5px`);
  }
  return insets;
}
