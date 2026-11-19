The starter renders **10,000 rows** into a scrollable box, and it's slow to mount and to scroll. Build a reusable `VirtualList` that renders only the rows in view (plus a few extra), without using a library.

## API

```js
export function VirtualList({
  items,          // any array
  itemHeight,     // fixed row height in px
  height,         // viewport height in px
  overscan = 3,   // extra rows rendered above and below the viewport
  renderItem,     // (item, index) => ReactNode
  label,          // accessible name of the list
})
```

## Requirements

1. The scroll container has a fixed `height` and scrolls through the **full** content height (`items.length × itemHeight`). The scrollbar must look and behave as if every row were there.
2. Only the rows that intersect the viewport, plus `overscan` rows on each side, are in the DOM. With 10,000 rows of 30px in a 300px viewport and an overscan of 3, that's **13 rows** at the top of the list.
3. Scrolling updates the rendered window. Rows are absolutely positioned, or offset, at `index × itemHeight`.
4. A **Jump to item** control (a number input plus a **Go** button) scrolls row N to the top of the viewport.
5. Accessibility:
   - The container is `role="list"` with an accessible name. Rendered rows are `role="listitem"` with `aria-posinset` (1-based) and `aria-setsize` (the total), so screen readers report "item 5,000 of 10,000" even though most rows aren't in the DOM.
   - The scroll container is keyboard-focusable (`tabIndex=0`), so keyboard users can scroll it with the arrow and Page keys.
6. Keep scrolling cheap: don't re-render rows that didn't change, and don't create layout thrash in the scroll handler.

## Follow-up

- Support **variable** row heights that are unknown until rendered.
- Ctrl+F (find in page) doesn't find off-screen rows. What are your options?
- When would you use `content-visibility: auto` instead of virtualising?
