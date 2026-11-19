Implement `deepEqual(a, b)`. It returns `true` if `a` and `b` have the same structure and the same primitive values at every position, even when they are different objects.

`===` compares objects by **reference**, so `{ x: 1 } === { x: 1 }` is `false`. A structural comparison is what test runners (`toEqual`), memoisation helpers and "has this form changed?" checks need.

```js
deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }); // true
deepEqual([1, 2], [2, 1]);                               // false (order matters)
deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 });               // true (key order doesn't)
deepEqual({ a: undefined }, {});                         // false
deepEqual(NaN, NaN);                                     // true
deepEqual([1], { 0: 1 });                                // false
```

## Signature

```js
deepEqual(a, b) // boolean
```

## Scope

Inputs are **JSON-like**: primitives (including `undefined`, `NaN`, `bigint`), plain objects and arrays, nested to any depth, without cycles.

## Requirements

- Primitives use **SameValueZero**: like `===`, except `NaN` equals `NaN`. (`0` and `-0` are equal.) This matches lodash's `isEqual`.
- An array is never equal to a non-array, even with matching keys.
- Arrays are equal if they have the same length and equal elements at every index.
- Objects are equal if they have the **same set of own enumerable string keys** and equal values for each. Key order doesn't matter. A key with value `undefined` is **not** the same as a missing key.
- `null` is only equal to `null`.

## Follow-up

- How would you support `Date`, `RegExp`, `Map` and `Set`?
- How would you handle cyclic structures?
- How does React compare props in `React.memo` by default, and why not deeply?
