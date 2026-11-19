Implement `minBy(array, iteratee)`. It calls `iteratee` on each element to get a value to rank by, and returns the **element** with the smallest one. The `iteratee` can also be a property name.

```js
const flights = [
  { id: 'A1', minutes: 95 },
  { id: 'B2', minutes: 70 },
  { id: 'C3', minutes: 120 },
];

minBy(flights, (f) => f.minutes); // { id: 'B2', minutes: 70 }
minBy(flights, 'minutes'); // { id: 'B2', minutes: 70 }
minBy([], (x) => x); // undefined
minBy([{ at: new Date('2024-05-01') }, { at: new Date('2023-01-01') }], (e) => e.at);
// { at: 2023-01-01 }  (Dates compare by their numeric value)
```

## Requirements

- `iteratee` is either a function called as `iteratee(element)`, or a string meaning `element[iteratee]`.
- Compare computed values with `<`.
- Skip elements whose computed value is `null`, `undefined` or `NaN`.
- On a tie, keep the **first** element that reached the minimum.
- Return `undefined` for an empty array, or when every element was skipped.

## Follow-up

- How would you get both the min and the max in one pass? How many comparisons does the pairwise trick save?
- How would you write `minBy` so it works on any iterable, such as a `Map`'s values?
