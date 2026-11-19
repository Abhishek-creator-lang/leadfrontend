A calendar app shows a "busy" bar above each day. Given the day's events as `[start, end]` pairs (minutes since midnight, in any order), write `mergeIntervals(events)`, which returns the **busy blocks**: the smallest list of non-overlapping intervals covering exactly the same time.

Events that overlap **or touch** (one ends at the minute the next starts) belong to the same busy block.

```js
mergeIntervals([
  [540, 600],  // 9:00–10:00 standup + planning
  [570, 630],  // 9:30–10:30 overlaps the first
  [630, 660],  // 10:30–11:00 touches the merged block
  [780, 840],  // 13:00–14:00 separate
]);
// [[540, 660], [780, 840]]

mergeIntervals([[60, 120], [0, 30]]); // [[0, 30], [60, 120]]
mergeIntervals([]);                   // []
```

## Requirements

- Return blocks sorted by start time.
- Don't mutate the input array or its inner arrays.
- An event can be zero-length (`start === end`), and one event can be fully contained in another.

## Constraints

- Up to 10⁵ events. Aim for O(n log n).

## Follow-up

- If the events arrive already sorted, what is the complexity?
- How would you compute the *free* slots between 9:00 and 17:00 instead?
