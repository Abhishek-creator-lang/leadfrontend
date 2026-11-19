Implement `maxBy(array, iteratee)`. It calls `iteratee` on each element to get a value to rank by, and returns the **element** (not the computed value) with the largest one.

```js
const products = [
  { name: 'pen', price: 3 },
  { name: 'lamp', price: 40 },
  { name: 'mug', price: 12 },
];

maxBy(products, (p) => p.price); // { name: 'lamp', price: 40 }
maxBy(['apple', 'fig', 'banana'], (s) => s.length); // 'banana'
maxBy([], (x) => x); // undefined
maxBy([{ n: 1 }, { n: null }, { n: 3 }], (o) => o.n); // { n: 3 }
```

## Requirements

- `iteratee` is called once per element with the element only: `iteratee(element)`.
- Compare computed values with `>`.
- Skip elements whose computed value is `null`, `undefined` or `NaN`: they can never be the answer.
- On a tie, keep the **first** element that reached the maximum.
- Return `undefined` for an empty array, or when every element was skipped.

## Follow-up

- Why not `Math.max(...array.map(iteratee))`? Name two problems.
- How would you return the top *k* elements instead of just one?
