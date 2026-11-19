## TL;DR

**Flexbox is one-dimensional and content-out**: items size themselves from their content and the container distributes leftover space along one axis, wrapping lines independently. **Grid is two-dimensional and layout-in**: you define tracks on the container and place items into them, so rows *and* columns stay aligned. Rule of thumb: **use Flexbox for components that flow (toolbars, button groups, tags, media objects) and Grid for page and card layouts where things must line up across rows**. **Subgrid** lets a nested element adopt its parent's tracks, so content *inside* sibling cards (titles, prices, buttons) aligns across cards. It has been supported in all major browsers since 2023.

## Decision guide

| Need | Reach for |
|---|---|
| Items in a row with dynamic widths, push one to the end (`margin-left: auto`) | Flexbox |
| Wrap tags or chips naturally; each line can differ | Flexbox (`flex-wrap`) |
| Responsive card grid where columns align on every row | Grid (`repeat(auto-fill, minmax(…))`) |
| Page shell: header / sidebar / main / footer, named areas | Grid (`grid-template-areas`) |
| Overlapping elements without absolute positioning | Grid (place multiple items in the same cell) |
| Align nested content across siblings | Grid + **subgrid** |
| Centre one thing | Either; `place-items: center` on a grid is shortest |

```css
/* Responsive cards: no media queries */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
  gap: 1.5rem;
}

/* Subgrid: every card's title, body and footer line up across the row */
.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
}
```

Without subgrid, a long title in one card pushes its button lower than its neighbours' buttons. With `grid-template-rows: subgrid`, the three rows of each card share track sizes with the parent grid row, so all titles, bodies and footers align.

`auto-fill` vs `auto-fit`: both create as many tracks as fit. `auto-fit` collapses empty tracks so a few items stretch to fill the row. `auto-fill` keeps empty tracks, so items keep their size.

## Flexbox details that trip people up

- `flex: 1` is `1 1 0%`: items share space **ignoring** their content size. `flex: auto` (`1 1 auto`) shares leftover space **after** content size.
- **`min-width: auto`** on flex items prevents shrinking below content size, which causes overflow with long URLs or code. Set `min-width: 0` (or `overflow: hidden`) on the shrinking item.
- `gap` works in flex layouts in all current browsers, so you no longer need margin hacks.

## Accessibility: visual order vs DOM order

`order`, `flex-direction: row-reverse`, `grid-auto-flow: dense` and explicit grid placement can make **visual order differ from DOM order**. Keyboard focus and screen readers follow the DOM, so users experience a jumbled sequence. Keep the DOM in logical order and use layout features for presentation that matches it. (CSS `reading-flow` is a newer proposal to address this, currently only in Chromium.)

## Pitfalls

- Building 2D grids from nested flex rows, then fighting misalignment with fixed heights.
- Using Grid for a simple toolbar and having to manage tracks for content of unknown length.
- Fixed pixel `minmax(300px, 1fr)` overflowing small screens. Wrap it in `min(…, 100%)`.

## In an interview, mention…

- One- vs two-dimensional, and content-out vs layout-in.
- Intrinsic sizing with `minmax`, `auto-fill`/`auto-fit`, and the `min-width: 0` fix.
- Subgrid for cross-card alignment and that it's now Baseline.
- Source order and accessibility when reordering visually.
