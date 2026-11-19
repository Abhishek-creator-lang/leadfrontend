## Approach: a pipeline of small steps

Each option is an independent stage. Writing them as separate steps on a working array keeps every rule easy to check:

```js
let result = rows.filter(matchesWhere);   // where (also makes the copy)
if (orderBy) result.sort(comparator);     // sorts the copy, never the input
result = result.slice(offset, limit === undefined ? undefined : offset + limit);
if (select) result = result.map(project);
```

### `where`

Turn the `where` object into a list of `[field, condition]` pairs once, then each row must pass `every` condition:

```js
function test(value, condition) {
  if (typeof condition === 'function') return Boolean(condition(value));
  if (Array.isArray(condition)) return condition.includes(value);
  return value === condition;
}
```

`filter` returns a new array, which is also our copy for the in-place `sort` that follows. Sorting `rows` directly would mutate the caller's array, a subtle bug because `Array.prototype.sort` sorts in place. (`toSorted` in ES2023 is the non-mutating alternative.)

### `orderBy`

Parse each key once into `{ field, direction }` (`-total` gives `{ field: 'total', direction: -1 }`). The comparator walks the keys in order and returns the first non-zero comparison:

```js
for (const { field, direction } of keys) {
  const a = rowA[field], b = rowB[field];
  const aMissing = a == null, bMissing = b == null;
  if (aMissing || bMissing) {
    if (aMissing && bMissing) continue;
    return aMissing ? 1 : -1;            // missing last, regardless of direction
  }
  if (a < b) return -direction;
  if (a > b) return direction;
}
return 0;
```

Note the null handling happens **before** applying `direction`, so missing values stay at the end in descending order too. That's what users expect from a table: blank cells sink to the bottom.

**Stability:** `Array.prototype.sort` has been required to be stable since ES2019, so returning `0` for ties keeps the original order. In an interview, say that you rely on this; in older engines you'd decorate each row with its index and use it as a final tiebreaker.

### Pagination and projection

`slice(offset, offset + limit)` handles out-of-range values gracefully. `select` builds new objects with only the requested fields, using `Object.hasOwn` (or `in`) so missing fields are omitted rather than set to `undefined`.

## Complexity

O(n × w) for filtering (w conditions), O(n log n × k) for sorting with k keys, O(m × s) for projection. Filtering **before** sorting matters: sorting 10 matching rows is much cheaper than sorting 100,000 and filtering afterwards.

## Edge cases

- Empty input or no matches: `[]`.
- `limit: 0`: `[]`. Check `limit === undefined` rather than `!limit`.
- `offset` beyond the end: `[]`.
- Mixed types in a sort column (`'10'` vs `9`): `<` coerces, so results can be surprising; real tables use typed columns.
- Conditions on fields that don't exist: the value is `undefined`, so equality to `undefined` matches; arrays and functions decide for themselves.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `rows.sort(...)` | Mutates the caller's data, which in React means a mutated prop or state |
| `a[field] - b[field]` comparator | Breaks for strings (`NaN`) |
| Applying `direction` to the null check | Blanks jump to the top when sorting descending |
| `limit` before `orderBy` | "Top 10 by total" returns 10 arbitrary rows, sorted |
| `if (!limit)` | `limit: 0` returns everything |

## Real-world connection

- **TanStack Table** and AG Grid run this pipeline (filter, sort, paginate) on the client, with per-column comparator functions and `sortUndefined: 'last'` options.
- **SQL:** this is `SELECT ... WHERE ... ORDER BY ... LIMIT ... OFFSET`, executed in the same logical order. Explaining that mapping is a good senior signal.
- **When to move it server-side:** once data no longer fits comfortably in memory, or you need total counts across pages, push the query to the API (`?status=paid&sort=-total&limit=20&cursor=...`). Prefer cursor pagination over offsets for large or changing datasets.

## Follow-ups

- **Locale-aware sorting:** use `Intl.Collator(undefined, { sensitivity: 'base', numeric: true }).compare` for strings, so `"item 2"` comes before `"item 10"` and case is ignored.
- **Nested fields:** support `'customer.name'` with a `get(row, path)` helper.
- **Memoisation:** in React, wrap the call in `useMemo` keyed on `rows` and `options` so it only reruns when inputs change.
