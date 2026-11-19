## TL;DR

**CSS containment** (`contain`) is a promise to the browser that an element's subtree is independent in some way (layout, paint, size, style), so the browser can **limit how far style, layout and paint work spreads** when something inside changes. **`content-visibility: auto`** builds on that: for elements **far from the viewport**, the browser **skips rendering their contents entirely** (style, layout, paint) until they're about to scroll into view. On long pages this can cut initial rendering time dramatically. You must pair it with **`contain-intrinsic-size`** so skipped elements still take up a plausible amount of space. It's Baseline across all major browsers since 2024.

## The `contain` values

| Value | Promise | Effect |
|---|---|---|
| `layout` | Inside layout doesn't affect outside (and vice versa) | Layout changes stay inside; also creates a containing block and stacking context |
| `paint` | Descendants don't paint outside the box | Clipping like `overflow: clip`; off-screen subtrees needn't be painted |
| `size` | The element's size doesn't depend on its children | You must give it a size, or it collapses to 0 |
| `inline-size` | Only the inline size is independent | What `container-type: inline-size` applies |
| `style` | Counters and quotes don't escape | Rarely needed |
| `content` | = `layout paint style` | A safe default for independent widgets |
| `strict` | = `size layout paint style` | Requires an explicit size |

## `content-visibility`

```css
.article-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 800px;  /* placeholder height until rendered */
}
```

- `auto`: applies layout, style and paint containment always, and **size containment plus skipped contents while off-screen**. Contents stay in the DOM and in the accessibility tree, and are **searchable with find-in-page** (the browser renders them when a match is found).
- `hidden`: always skip contents, like `display: none` but preserving the rendering state cache, so it's cheap to show again. Contents are not accessible or findable.
- `contain-intrinsic-size: auto 800px` means "use 800px until rendered once, then remember the last real size". That prevents the scrollbar from jumping and avoids layout shift as sections render.

Typical wins: long articles, documentation pages, comment threads, settings pages, feeds where virtualisation would be overkill.

## What can go wrong

- **No intrinsic size** → off-screen sections collapse to 0 height, the scrollbar lies, and content shifts as you scroll (CLS).
- **Bad estimates** → the scroll position jumps when real sizes replace placeholders. The `auto` keyword mitigates this after first render.
- **Containment side effects**: `paint` containment clips overflowing content (dropdowns or tooltips inside the section get cut off), and `layout` containment creates a new containing block for `position: fixed` descendants and a new stacking context, which can break modals rendered inside.
- **Measuring hidden content**: `getBoundingClientRect()` on elements inside skipped subtrees forces rendering, which removes the benefit.
- **Tiny elements**: applying it to thousands of small items adds overhead for little gain. Apply it to large, coarse sections.
- **Sticky or anchor-linked content**: jumping to `#section-12` works, but the scroll target may move slightly as earlier sections render.

## How to verify

- DevTools Performance panel: compare rendering time (purple Layout and Recalculate Style) before and after.
- The `contentvisibilityautostatechange` event tells you when an element starts or stops being skipped, which is useful for pausing work such as canvas animations.

## Compared with virtualisation

`content-visibility` keeps **all DOM nodes** (memory and JS cost remain), but preserves accessibility and find-in-page, and it's a one-line change. Virtualisation removes DOM nodes, which scales to far larger lists but costs complexity and accessibility work.

## In an interview, mention…

- What each `contain` value promises and why it lets the engine skip work.
- `content-visibility: auto` + `contain-intrinsic-size: auto <estimate>`.
- Side effects: clipping, containing blocks, stacking contexts, scroll jumps.
- When you'd choose it over virtualisation.
