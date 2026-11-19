## Architecture

```
App            years, bucketSize, asTable   (state)
├─ toolbar     <select> + "Show as table" toggle button
├─ <figure>
│   ├─ Histogram       (bars, a <ul>)       ┐ same `buckets` prop,
│   └─ HistogramTable  (data table)         ┘ two presentations
└─ AddYearForm draft + error (local state)
```

The key split: **`bucketize(years, size)` is a pure function**, outside any component. It's trivially unit-testable and reusable (for example in a worker, see below), and both presentations read the same derived `buckets`.

## State design

- `years` is the only real data. Buckets are **derived**, never stored, so changing the bucket size or adding a year can't leave stale bars.
- `useMemo(() => bucketize(years, bucketSize), [years, bucketSize])`. For 16 items memoization is pointless. For tens of thousands it stops every keystroke in the "Add a year" input from re-bucketing. Note that the form keeps its draft in **its own** component state, so typing there doesn't even re-render `App`. Colocating state is the first optimisation, memoization the second.
- Adding a year uses the functional updater `setYears(prev => [...prev, y])` with a new array, which keeps the memo dependency honest.

## Bucketing

`start = Math.floor(year / size) * size` aligns buckets to multiples of the size, so the 10-year buckets are `1980–1989` and not "1983–1992". One pass counts into a `Map` and tracks min/max, then a second loop walks `min…max` in steps of `size` to **fill empty buckets with 0**. A histogram that drops empty bins misrepresents the distribution, which is the most common bug in this question. The total cost is O(n + number of buckets).

The bar height is `count / max * 100%`, with `max` clamped to at least 1 to avoid dividing by zero when every bucket is empty.

## Accessibility

Charts are a classic accessibility failure: a pile of `<div>`s with heights means nothing to a screen reader.

- The chart is a **list**, so screen readers announce "list, 5 items" and users can step through bars.
- Each bar carries a visually hidden sentence (`1980–1989: 6 people`). The visible count and label are `aria-hidden` to avoid reading everything twice. Pluralisation (`1 person`) matters for listening comprehension.
- The **table view** is the WAI recommendation for complex images: a real `<table>` with `<caption>`, `scope="col"` headers and row headers (`<th scope="row">`) lets users navigate by cell. The toggle is a `<button aria-pressed>`, a toggle button that announces its state.
- `<figure>` + `<figcaption>` ties the summary ("16 people responded") to the chart.
- The form uses a real `<label>`, `aria-invalid`, `aria-describedby` → the error, and `role="alert"` so the error is announced on submit. `noValidate` lets us show our own consistent message instead of the browser's bubble. Because the bar meaning never depends on colour alone, the indigo bars are fine for colour-blind users.

## Edge cases

- Empty data: render "No data yet." instead of a zero-height chart (and avoid `Math.max()` of an empty list, which is `-Infinity`).
- A single year: one bucket at 100% height.
- Input like `"19a0"`, `"  1990 "`, `"1990.5"`: validated against `/^\d{4}$/` after trimming, then range-checked. `Number('')` is `0`, so never rely on `Number()` alone.
- Very wide ranges with bucket size 1 (e.g. 1900–2024 = 125 bars): the bar slots have a `min` width and the chart scrolls horizontally rather than squeezing bars to nothing.

## Scaling: 10 million records

- **Don't ship raw rows to the browser.** Ask the API for pre-aggregated counts (`GET /respondents/histogram?bucket=10` → `[{start, count}]`). This is a `GROUP BY floor(year / 10)` in SQL, and the payload is a few dozen numbers instead of tens of megabytes.
- If you must aggregate client-side, do it once into **per-year counts** (at most ~125 numbers). Any bucket size is then a cheap re-sum of those counts, not a pass over 10M rows. Run that first pass in a **Web Worker** so the main thread stays responsive, and stream the data in chunks.
- Rendering is never the bottleneck: the number of bars is bounded by the year range, not by the data size.

## Follow-ups

- **Tooltip:** show it on hover *and* focus. That means making each bar focusable (or using the table for keyboard users), with `aria-describedby` linking to the tooltip and <kbd>Escape</kbd> to dismiss (WCAG 1.4.13).
- **Y-axis ticks:** compute "nice" steps (1, 2, 5 × 10ⁿ) so the axis reads 0, 2, 4, 6 rather than 0, 1.5, 3, 4.5.
- **Responsive:** use a `ResizeObserver` to choose the label density, or rotate labels when bars get narrow.
- **SVG vs DOM:** SVG gives precise axes and export but needs `role="img"` plus a text alternative or ARIA on each `<rect>`. DOM/CSS bars get list and table semantics nearly for free.
