A single demo screen at a conference can show one session at a time. Speakers have requested slots as half-open `[start, end)` intervals, and some requests clash. Write `minRemovals(requests)`, which returns the **fewest requests to reject** so that no two remaining sessions overlap.

Half-open means sessions that touch (one ends at 60, the next starts at 60) do **not** overlap.

```js
minRemovals([[0, 60], [30, 90], [60, 120], [0, 120]]);
// 2: keep [0, 60] and [60, 120]; reject [30, 90] and [0, 120]

minRemovals([[10, 20], [10, 20], [10, 20]]); // 2
minRemovals([[0, 10], [10, 20]]);            // 0
minRemovals([]);                             // 0
```

## Constraints

- Up to 10⁵ requests, unsorted, with `start < end`.
- Aim for O(n log n).
- Don't mutate the input.

## Follow-up

- Why does sorting by **end** time work, while sorting by start time (or by length) does not?
- What if each session had a value (expected audience) and you wanted to maximise the total value instead?
