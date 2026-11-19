## TL;DR

Virtualisation (windowing) renders **only the rows in or near the viewport**, plus a spacer that gives the scroll container its full height. That keeps the DOM at a few dozen nodes instead of tens of thousands, which cuts memory, style and layout cost, and INP. The price is complexity: **variable row heights, scroll anchoring, keyboard and screen-reader navigation, browser find-in-page, printing and SEO** all get harder. Use it when you have a few thousand complex rows. Below that, pagination or `content-visibility: auto` is often enough.

## How it works

```
scrollTop = 12,000px, rowHeight = 40px, viewport = 600px
first = floor(12000 / 40) = 300, visible = ceil(600 / 40) = 15
render rows 295..320 (overscan 5), each translated to index * 40px
spacer height = totalRows * 40px
```

```js
function getWindow(scrollTop, viewportH, rowH, total, overscan = 5) {
  const start = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
  const end = Math.min(total, Math.ceil((scrollTop + viewportH) / rowH) + overscan);
  return { start, end, offsetY: start * rowH, totalHeight: total * rowH };
}
```

Libraries such as TanStack Virtual and react-window handle the hard parts: measuring variable-height rows with `ResizeObserver`, keeping a prefix-sum of heights for O(log n) offset lookups, keeping the scroll position stable when rows above the viewport change height, horizontal and grid virtualisation, and reverse lists (chat).

## Decision guide

| Situation | Approach |
|---|---|
| < ~300 simple rows | Plain rendering is fine; measure first |
| Long article-like page with sections | `content-visibility: auto` + `contain-intrinsic-size` |
| Thousands of rows, interactive cells (data grid, logs, feed) | Virtualise |
| User needs to scan or compare a bounded set | Pagination, which is also better for shareable URLs |
| Infinite feed | Virtualise + cursor pagination + cap the retained pages |

```css
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 320px; /* remembers real size once rendered */
}
```

`content-visibility: auto` skips rendering work for off-screen elements but **keeps them in the DOM**, so find-in-page, anchors and the accessibility tree still work. It doesn't reduce DOM node count or JS memory, though. It is Baseline in all major browsers since 2024.

## Costs and how to mitigate them

- **Accessibility.** Screen readers only see the rendered rows. Use the correct roles (`role="grid"` or a list with `aria-setsize` and `aria-posinset`) so the total count and position are announced, and manage focus so keyboard navigation scrolls the next row into existence before focusing it.
- **Find in page (Ctrl+F)** can't find unrendered rows. Provide a real search box.
- **Scroll jumps** with estimated heights. Measure, cache measured heights, and use a good estimate.
- **Printing and SEO.** Content that isn't rendered isn't printed or indexed. Server-render the first page, with real links to paginated URLs.
- **Fast scrolling** shows blank areas. Increase overscan, keep rows cheap, and avoid heavy work on mount (lazy-load row images).
- **Sticky headers, drag-and-drop and row selection** across unrendered rows need state that lives outside the DOM.

## In an interview, mention…

- That it's a DOM-size fix. Profile first: is the cost in rendering, data processing or the network?
- The mechanics (spacer, offset, overscan) and the variable-height challenge.
- Accessibility (`aria-setsize`/`aria-posinset`, focus management) and the find-in-page trade-off.
- `content-visibility` as a lighter-weight alternative for document-style pages.
