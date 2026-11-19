## Why virtualise?

Mounting 10,000 rows means 10,000 React fibres, 10,000 DOM nodes, and style and layout work for all of them. Mounting takes hundreds of milliseconds, memory grows, and every re-render of the list is expensive. **Windowing** keeps the DOM proportional to the *viewport* (about 16 rows), not the data.

## The technique

```
viewport (fixed height, overflow:auto, onScroll → scrollTop state)
└─ spacer (height = count × itemHeight)  → gives the scrollbar its real size
   └─ rows [start, end)  absolutely positioned at translateY(index × itemHeight)
```

The window maths is a pure function:

```js
first   = floor(scrollTop / itemHeight)
visible = ceil(height / itemHeight)
start   = max(0, first - overscan)
end     = min(count, first + visible + overscan)
```

At the top that's 0 → 13 (10 visible + 3 overscan below). Mid-list it's 16 rows. Keeping it pure (`getRange`) makes the edge cases (top, bottom, empty list) trivially unit-testable.

**Overscan** renders a few rows beyond each edge, so fast scrolling doesn't flash blank space before React catches up. More overscan means fewer blank flashes but more work per scroll.

## Performance details

- **Memoised rows:** `Row` is `React.memo`. When the window shifts by one row, the 15 rows still in range keep identical props (`item`, `index`, `top`, and a **stable** `renderItem` from `useCallback`), so only the new row renders. An inline `renderItem={(i) => …}` silently defeats this, which is a good point to raise.
- **Stable keys:** rows are keyed by item id, so a row keeps its DOM node as it moves within the window. Index keys would work for a static list but break with reordering.
- **`transform` instead of `top`:** translating a positioned element is composited. The scroll handler only reads `event.currentTarget.scrollTop` and never calls `getBoundingClientRect()` or `offsetHeight`, which would force synchronous layout (layout thrash).
- **Re-render cadence:** `onScroll` fires at most once per frame in modern browsers, and React 18 batches the update. If the row renderer is heavy, wrap the update in `startTransition` or only update state when `start` actually changes (store `scrollTop` in a ref and compare ranges).
- `overscroll-behavior: contain` stops the page from scrolling when the list reaches its end.

## Accessibility

- `role="list"` with an accessible name, and `role="listitem"` rows with **`aria-setsize`** (total) and **`aria-posinset`** (1-based index). Screen readers announce "Item 5,000, 5,000 of 10,000" even though only 16 rows exist. Without these attributes, users hear "list, 16 items", which is wrong.
- **A focusable scroll container** (`tabIndex=0`) is required for keyboard users to scroll a region with no focusable children (axe rule `scrollable-region-focusable`, WCAG 2.1.1).
- **Find in page (Ctrl+F)** can't see rows that aren't rendered. Mitigations: provide your own search or filter box (the usual answer), or "Jump to item" as here.
- If rows are interactive (a listbox or grid), use `aria-activedescendant` or a roving tabindex on rendered rows, and **scroll the active index into the window before focusing it**. Otherwise focus is lost when the focused row is unmounted. Keep the focused row rendered even when it's outside the window.

## Imperative API

`forwardRef` + `useImperativeHandle` exposes `scrollToIndex(i)`, the same shape libraries use. It sets `scrollTop` on the DOM node **and** updates state, because assigning a value equal to the current `scrollTop` fires no scroll event. It also lets the component work in test environments with no layout.

## Variable heights (follow-up)

1. Render with an **estimated** height, then measure real rows after render (`ResizeObserver` or `useLayoutEffect` with `getBoundingClientRect`) and cache them by index.
2. Keep a **prefix sum** of heights (or a Fenwick tree for O(log n) updates). The offset of row `i` is `sum(0..i-1)`, and the first visible row is a binary search for `scrollTop` in the prefix array.
3. When a row above the viewport changes size, **adjust `scrollTop`** by the delta so content doesn't jump (scroll anchoring).
4. For chat-style lists that start at the bottom, anchor to the end and correct as older messages are measured.

## Alternatives and trade-offs

| Approach | When |
|---|---|
| Plain rendering | Up to a few hundred simple rows. Measure first. |
| `content-visibility: auto` + `contain-intrinsic-size` | Long *documents* or feeds. Keeps Ctrl+F, semantics and SEO, but DOM nodes and memory remain. |
| Windowing (this) | Thousands or more of uniform rows, tables, logs |
| Pagination | When users don't need continuous scrolling, or for SEO |
| Libraries (react-window, TanStack Virtual) | In production, they cover variable sizes, horizontal and grid layouts, sticky rows and RTL |

## Edge cases

- Empty `items`: the range is `[0, 0)` and the spacer height is 0.
- `height` not divisible by `itemHeight`: `ceil` renders the partially visible row.
- The data changes while scrolled down: if the new list is shorter, the browser clamps `scrollTop` and fires a scroll event. You can also clamp `scrollTop` against `count × itemHeight - height` yourself.
- Very large lists (over ~1M rows × 30px): browsers cap element heights (around 16–33M px). Scale the scroll space, or paginate.

## Follow-ups

- *"Why not `IntersectionObserver` per row?"* You'd still need all the rows in the DOM to observe them. Windowing removes them.
- *"How do you test it?"* The window maths as a pure function, plus jsdom tests that set `scrollTop` and fire `scroll` (jsdom has no layout), then real-browser tests for smoothness.
