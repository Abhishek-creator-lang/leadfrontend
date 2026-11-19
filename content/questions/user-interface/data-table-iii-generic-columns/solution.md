## The real question: API design

Parts I and II were about state. Part III is about **component API design**, which is what a design-system or lead-level interview is really probing. The table logic barely changes; what changes is that every user-specific decision moves out of the component and into a **column definition**:

```js
{
  key: 'price',
  label: 'Price',
  value: (row) => row.price,          // accessor: what we sort and filter on
  render: (row) => currency.format(row.price), // what we display
  sortable: true,
  compare: (a, b) => a - b,          // optional custom comparator
  filter: 'range',                    // 'text' | 'range' | undefined
}
```

The key insight is **separating the value from its presentation**. Sorting `"$1,250,000"` and `"$297,500"` as strings puts the million-dollar house first. Sorting and filtering always use `value(row)`; only the cell uses `render(row)`. The same split handles dates (sort on the timestamp, render "3 days ago"), status enums (sort by severity rank, render a badge) and nested data (`value: (row) => row.address.city`).

Sensible **defaults** keep simple configs short: `value` defaults to `row[key]`, `render` to the value, `sortable` to `true`, and `compare` to a type-aware comparator (numbers by subtraction, everything else via a shared `Intl.Collator` with `numeric: true`, nulls last).

## State design

Each `DataTable` instance owns:

```js
sort     // { key, direction } | null
filters  // { [columnKey]: string | { min, max } }
pageSize, page
```

Filters are a single object keyed by column, so the component handles any number of filterable columns without new state variables. Updates are immutable (`{ ...prev, [key]: value }`).

The pipeline is the same as part II and is memoised on `[data, columns, filters, sort]`:

```
data → filter (every column's predicate, AND) → sort (column accessor + comparator) → paginate
```

**Stable `columns` identity matters.** If a consumer writes `columns={[...]}` inline, the array is new on every parent render and `useMemo` recomputes every time. The demo defines column arrays at module scope; in docs you'd tell consumers to hoist them or wrap them in `useMemo` (TanStack Table makes the same request). If a column renderer needs props, `useMemo` with those props as deps.

**Stale sort key.** If the consumer removes the sorted column, `columns.find` returns nothing and the table falls back to unsorted rather than crashing.

### Range filter semantics

`min`/`max` are kept as the input strings, not numbers, so the user can clear a field (`''`) and an in-progress value like `-` doesn't get coerced to `NaN` and then `0`. Comparison converts at filter time; `!(value >= min)` also excludes `null`/`NaN` values when a bound is set.

## Accessibility

- Each instance renders `<section aria-labelledby>` + `<h2>` and the `<table>` is labelled by the same heading. Two tables on one page are now distinguishable in the landmarks/tables list ("Users table", "Houses table"), and tests can target them with `getByRole('table', { name: 'Houses' })`.
- IDs come from `useId`, so two instances never collide.
- Filters are inside a `<fieldset>` with a `<legend>`; the min/max pair is a `role="group"` with an `aria-label`, so a screen reader hears "Price range, group, Minimum Price".
- `aria-sort` on the `<th>`, a real `<button>` inside sortable headers, and plain text for non-sortable ones (a button that does nothing is worse than no button).
- The pagination `<nav>` is labelled per table ("Houses pagination") so landmarks aren't duplicated with the same name.
- Numeric columns are right-aligned with `tabular-nums` (an `align` hint in the column def) so digits line up, which is a readability win for everyone.

## Production considerations

- **Headless vs batteries-included.** This component renders its own markup. Libraries like TanStack Table go further: a hook returns the processed rows and header metadata, and you render whatever markup you want. That's more flexible for a design system with many table variants; mention the trade-off.
- **Controlled state.** Accept `sort`/`onSortChange`, `filters`/`onFiltersChange` etc. so a parent can sync to the URL or move the work to a server. Uncontrolled by default, controlled when props are present.
- **Server-side mode.** A `manual` flag that skips local filter/sort/paginate and calls `onQueryChange({ sort, filters, page, pageSize })`, with `totalCount` passed back in. Column definitions stay the same; `value`/`compare` are just unused.
- **Row actions and selection.** A column with `render: (row) => <button onClick={() => onEdit(row)}>Edit</button>` and `sortable: false` works today. Selection is better as a built-in feature (checkbox column, `aria-selected` on rows, select-all with indeterminate state).
- **Large data.** Virtualise the body rows; for >50k rows move filtering/sorting to a Web Worker or the server.
- **Types.** In TypeScript, `ColumnDef<Row>` with `key: keyof Row & string`, `value?: (row: Row) => V`, and `render?: (row: Row) => ReactNode` gives consumers autocompletion and catches typos.

## Follow-ups

- Column visibility toggles and resizing (persist per user).
- Custom filter types: a `filter` object with `{ type, render, predicate }` instead of a string union, so consumers can add a date-range or select filter without changing the table.
- Multi-column sort with shift-click.
