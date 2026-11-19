## State design

Only two things are **state**: `page` and `pageSize`. Everything else is **derived** during render:

```js
const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
const currentPage = Math.min(page, totalPages);
const rows = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);
```

A common mistake is to store `rows` or `totalPages` in state and keep them in sync with `useEffect`. That costs an extra render, and for one frame the UI shows stale rows. React's guidance ("Choosing the State Structure") is: if you can compute it from props and state, don't store it.

Two small but important details:

- **Clamp the page.** If the parent removes users while you're on page 5 of 5, `page` would point past the end and the table would look empty. `Math.min(page, totalPages)` fixes it during render, with no effect. `Math.max(1, …)` keeps "Page 1 of 1" for an empty list instead of "Page 1 of 0".
- **Reset to page 1 when the page size changes.** Page 3 of 5-per-page and page 3 of 20-per-page show completely different rows. An alternative that some products prefer is to keep the *first visible row* on screen: `setPage(Math.floor(start / newSize) + 1)`.

Pages are **1-based** in state because that's what users see; converting at the slice keeps off-by-one bugs in one place.

## Accessibility

| Concern | Solution |
|---|---|
| Table semantics | Real `<table>` with `<caption>`, `<thead>` and `<th scope="col">`. Screen readers announce column headers as you move between cells. Avoid div-based "tables" unless you add `role="table"`/`row`/`cell` yourself. |
| Pagination landmark | `<nav aria-label="Pagination">` makes it discoverable from the landmarks menu. |
| Icon buttons | `aria-label="Previous page"` / `"Next page"`; the `‹ ›` glyphs alone have no meaningful name. |
| Disabled state | Native `disabled` removes the button from the tab order and announces it as unavailable. |
| Announcing changes | The `Page X of Y` text is in an `aria-live="polite"` region so the new page is announced after a click. |
| Labels | `<label htmlFor>` with an id from `useId` so it's unique per instance. |

## Edge cases

- Empty list: one row with `colSpan` saying "No users." rather than an empty `<tbody>`.
- Last page with fewer rows: the table gets shorter. If layout shift matters, give the table a `min-height` or pad with empty rows.
- Keys use `user.id`, not the index. With index keys, moving to page 2 would reuse the DOM rows of page 1 with new content, which breaks any row-local state (e.g. an expanded row or a focused checkbox).

## Scaling it

- **Server-side pagination.** For thousands of rows, request one page at a time: `GET /users?page=3&limit=10` returning `{ items, total }`. Then `page`/`pageSize` drive a fetch (with an `AbortController` or an "ignore stale response" flag), and you show a loading state. Prefetching the next page makes Next feel instant.
- **Cursor pagination** (`?after=<cursor>`) is more robust when rows are inserted while users browse, but you lose "jump to page 7" and "Page X of Y".
- **URL state.** Put `page` and `pageSize` in the query string so refresh, back/forward and shared links keep the position.
- **Very long single pages** (e.g. 500 rows per page): virtualize the rows (see *Virtualized List*).

## Follow-ups

- Numbered page buttons with ellipses (`1 … 4 5 6 … 20`), each with `aria-current="page"` on the current one.
- Sorting and filtering (part II): both must reset the page to 1, otherwise you can end up on page 4 of a 1-page result.
- Generic columns with custom renderers (part III).
