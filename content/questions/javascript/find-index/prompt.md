Implement `findIndex(array, predicate, fromIndex)` without using the built-in `findIndex`. It returns the index of the **first** element, searching forwards from `fromIndex`, for which `predicate` returns a truthy value. If no element matches, return `-1`.

```js
const users = [
  { name: 'ada', active: false },
  { name: 'bob', active: true },
  { name: 'cy', active: true },
];

findIndex(users, (u) => u.active); // 1
findIndex(users, (u) => u.active, 2); // 2
findIndex(users, (u) => u.name === 'zed'); // -1
findIndex([1, 2, 3, 4], (n) => n % 2 === 0, -2); // 3  (starts at index 2)
```

## Requirements

- `predicate` is called as `predicate(value, index, array)`.
- `fromIndex` defaults to `0`.
- A negative `fromIndex` counts from the end (`-1` is the last element). If that still lands before `0`, start at `0`.
- A `fromIndex` at or past the end means there's nothing to search, so return `-1`.
- Stop at the first match. Don't call the predicate for later elements.

## Follow-up

- How would `findIndex` differ from `indexOf` for `NaN`?
- Why might you prefer a `Map` from id to index if you call `findIndex` many times on the same list?
