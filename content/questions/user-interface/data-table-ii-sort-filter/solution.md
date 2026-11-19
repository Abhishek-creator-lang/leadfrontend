## State design

The minimal state is four values:

```js
const [query, setQuery] = useState('');
const [sort, setSort] = useState(null);   // { key, direction } | null
const [pageSize, setPageSize] = useState(5);
const [page, setPage] = useState(1);
```

The visible rows are a **pipeline derived during render**: `users → filter(query) → sort(sort) → slice(page)`. Nothing in that pipeline is stored. Storing `filteredUsers` in state and updating it from an effect is the classic mistake: it renders twice per keystroke and briefly shows stale rows.

**Order matters:** filter before sort (sorting fewer items is cheaper) and paginate last (pagination is a view of the final list, so "Page 1 of 3" counts filtered rows).

### Memoisation

```js
const visibleUsers = useMemo(() => /* filter + sort */, [users, query, sort]);
```

Paging and changing the page size don't change the inputs, so they reuse the memoised list instead of re-sorting. For 23 rows this doesn't matter; for 20 000 rows an `O(n log n)` sort on every page click would. The dependency array is honest because `users` is a stable prop and `sort` is replaced (never mutated) on each change.

### Sorting correctly

- **Never sort the prop in place.** `Array.prototype.sort` mutates; `users.sort()` would reorder the parent's array behind React's back. Copy first (`[...filtered]`), or use `toSorted()` in modern runtimes.
- **Type-aware comparison.** Numbers use `a - b`. Strings use a shared `Intl.Collator` with `sensitivity: 'base'` and `numeric: true`, so "émile" sorts next to "Emile", case is ignored and "item 9" comes before "item 10". Creating the collator once is much faster than calling `localeCompare` with options in the comparator.
- **Stable sort.** Since ES2019 `sort` is stable, so equal ages keep their original order (by id), which keeps the UI predictable.
- **Direction** is a factor (`1` or `-1`) multiplied into one comparator, rather than sorting and then reversing (reversing would also flip the order of equal items).

### Resetting the page

Every action that changes the *set or order* of rows calls `setPage(1)` in the same event handler, so React batches it into one render. Page 3 of an unfiltered list is meaningless after filtering down to one page. The `Math.min(page, totalPages)` clamp from part I is still there as a safety net.

## Accessibility (APG sortable table)

| Concern | Solution |
|---|---|
| Sort state | `aria-sort` on the **`<th>`**, not on the button, and only on the sorted column. A screen reader announces "Age, column header, sorted ascending". |
| Sort control | A `<button>` inside each `<th>`: focusable, Enter/Space work, and its name is the column label. The arrow glyph is `aria-hidden`; the direction is conveyed by `aria-sort`, not by the glyph. |
| Search label | A visually hidden `<label>` (the placeholder is not a label; it disappears while typing and has poor contrast). |
| Result count | `aria-live="polite"` so "12 results" is announced after typing settles. Polite regions don't interrupt typing. |
| Empty state | A row with `colSpan` keeps the table structure intact for assistive tech. |

A `.visually-hidden` class (clip/1px technique) is preferred over `display: none`, which would hide the label from screen readers too. Make sure it's in your stylesheet.

## Edge cases

- Leading/trailing spaces in the query are trimmed; an empty query shows everything.
- Searching numbers: `String(user[key])` makes it safe if you later add numeric searchable fields.
- `null`/`undefined` values: in production, sort them last regardless of direction.

## Scaling it

- **Server-side sort/filter** for large data: `GET /users?q=eng&sort=age&order=desc&page=1&limit=10`. Debounce the query (≈300 ms) before fetching, cancel in-flight requests with `AbortController`, and ignore out-of-order responses. Keep the previous rows visible with a subtle loading indicator rather than flashing an empty table.
- **Client-side but big**: debounce the *expensive work*, not the input. `useDeferredValue(query)` lets the input stay responsive while React renders the filtered list at lower priority.
- **URL state**: put `q`, `sort`, `order` and `page` in the query string so results are shareable and survive refresh.
- **Multi-column sort** (shift-click): `sort` becomes an array of `{ key, direction }` and the comparator walks it until a non-zero result.

## Follow-ups

- Tri-state sort (asc → desc → none) is useful when the original order is meaningful (e.g. "relevance" or insertion order).
- Per-column filters (a range for age, a select for occupation), which leads into part III's generic column definitions.
