## Approach

Group by `user` in a single pass with a `Map`, then shape the output.

1. Create `const byUser = new Map()`. A `Map` preserves insertion order, so iterating it later gives users in order of their first session for free. It also keeps numeric user ids as numbers (an object would turn them into strings **and** re-order integer-like keys ascending, which breaks the required order).
2. For each session:
   - If the user isn't in the map yet, insert `{ user, duration: 0, equipment: new Set() }`.
   - Add the session's `duration`, and add each equipment item to the set.
3. Convert: for each accumulated entry, produce `{ user, duration, equipment: [...set].sort() }`.

Using a `Set` while accumulating keeps de-duplication O(1) per item, and sorting once at the end is cheaper than keeping a sorted array along the way.

### Why the object-key version is wrong here

```js
const acc = {};
acc[7] = …; acc[1] = …;
Object.values(acc); // user 1 comes first!
```

Integer-like keys are always enumerated in ascending numeric order, regardless of insertion order. That silently violates the "first appearance" requirement. This is the bug interviewers are looking for.

## Immutability

The accumulator creates fresh objects and fresh arrays, and only *reads* from the input. A common shortcut is to take the first session object as the accumulator and `push` the later equipment into its array. That mutates the caller's data. If this runs in a Redux reducer or on React state, it causes stale UI and bugs that are very hard to trace.

## Complexity

With n sessions, E total equipment entries, and u users:

- Grouping: O(n + E).
- Sorting: O(Σ k log k) over each user's k distinct items, at most O(E log E).
- Space: O(u + E).

A naive version that, for each session, searches the output array with `find` is O(n × u), and `includes` for equipment adds O(k) per insert. Fine for 10 rows, painful for 100,000.

## Edge cases

- Empty input: `[]`.
- A user with only empty equipment lists: `equipment: []`.
- The same item repeated within a single session: still appears once.
- User id `0`: fine as a `Map` key. Checks like `if (!userId) return` elsewhere in the pipeline would wrongly drop it, so test it explicitly.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Plain object keyed by numeric user id | Output order becomes ascending by id |
| Reusing the first session object as the accumulator | Mutates the input, and the output shares arrays with it |
| `concat` then `sort` without de-duplication | Duplicate equipment |
| `sort()` on the input's `equipment` array | Mutates the input |
| Copying extra keys with `...session` | Leaks unrelated fields (and the wrong `duration`) into the output |

## Follow-ups interviewers ask

- **Streaming:** keep the `Map` (with `Set`s) as long-lived state. Each incoming record updates one entry in O(k). Derive the sorted array view lazily (memoised per user) when rendering.
- **Configurable rules:** pass a merge spec such as `{ duration: (a, b) => a + b, equipment: union }`. That turns the function into a small generic `mergeBy(records, key, reducers)`, which is what a lead-level answer should point towards.
- **Server vs client:** if the data is large, ask whether the API can return the aggregated view (`GROUP BY user`) instead of shipping every session to the browser.
