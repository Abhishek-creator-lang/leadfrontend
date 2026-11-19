Implement `findLastIndex(array, predicate, fromIndex)` without using the built-in `findLastIndex`. It searches **backwards**, starting at `fromIndex`, and returns the index of the first element it meets for which `predicate` returns a truthy value. If none matches, return `-1`.

```js
const events = [
  { type: 'click', at: 1 },
  { type: 'save', at: 2 },
  { type: 'click', at: 3 },
  { type: 'scroll', at: 4 },
];

findLastIndex(events, (e) => e.type === 'click'); // 2
findLastIndex(events, (e) => e.type === 'click', 1); // 0
findLastIndex(events, (e) => e.type === 'save', -3); // 1  (starts at index 1)
findLastIndex(events, (e) => e.type === 'drag'); // -1
```

## Requirements

- `predicate` is called as `predicate(value, index, array)`, visiting indices in descending order.
- `fromIndex` defaults to `array.length - 1`.
- A negative `fromIndex` counts from the end (`-1` is the last element). If it lands before `0`, there is nothing to search: return `-1`.
- A `fromIndex` at or past the end is clamped to `array.length - 1`.
- Stop at the first match.

## Follow-up

- What's a real UI case where you need the *last* match rather than the first?
- How would you find the last match without `findLastIndex` in an environment that only has ES2015 built-ins, without copying the array?
