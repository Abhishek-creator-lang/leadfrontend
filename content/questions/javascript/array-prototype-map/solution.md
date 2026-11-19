## Approach

1. Reject `null`/`undefined` receivers and take `O = Object(this)`.
2. Read `length` once, then validate `callbackFn` (the spec checks callability after reading the length but before the loop).
3. Pre-size the result with `new Array(length)`. That creates an array whose slots are all holes, which is exactly what we want for indices we never visit.
4. For each `k` with `k in O`, set `result[k] = callbackFn.call(thisArg, O[k], k, O)`.

Writing to `result[k]` instead of pushing is the key detail: it keeps every mapped value at the same index as its source, and missing indices stay missing.

## Complexity

O(n) time plus the callback's cost, O(n) space for the result.

## Edge cases

- **Sparse arrays:** `[1, , 3].map(f)` calls `f` twice and returns a length-3 array with a hole at index 1.
- **`Array(3).map(...)`:** all three slots are holes, so the callback never runs and you get `[ <3 empty items> ]`. Fix it with `Array.from({ length: 3 }, (_, i) => i)` or `[...Array(3)].map(...)`, since spreading turns holes into real `undefined` values.
- **Mutation during iteration:** pushes are ignored because `length` was captured. A deleted element is not visited and leaves a hole.
- **Explicit `undefined`:** `[undefined].map(f)` **does** call `f`, because index 0 exists.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `result.push(...)` | Holes collapse, so the result is shorter and indices shift |
| No `k in O` check | Callback runs for holes with `undefined` |
| `callbackFn(O[k])` only | Callers relying on `index` or `array` break |
| `callbackFn(...)` without `.call(thisArg, ...)` | `thisArg` is ignored |
| Arrow function for `myMap` | `this` is not the array |

## The `parseInt` trap

`map` passes three arguments, so `['1', '2', '3'].map(parseInt)` calls `parseInt('1', 0)`, `parseInt('2', 1)` and `parseInt('3', 2)`. Radix 0 means "auto", so the first is `1`. Radix 1 is invalid, so `NaN`. `'3'` is not a binary digit, so `NaN`. Use `.map(Number)` or `.map((s) => parseInt(s, 10))`.

## Follow-ups

- **Species:** the native method uses `ArraySpeciesCreate(O, length)`, so subclasses get an instance of the subclass. This polyfill always returns a plain `Array`.
- **Immutability:** `map` is the backbone of immutable updates in React (`items.map((it) => (it.id === id ? { ...it, done: true } : it))`). It returns a new array reference even when nothing changed, which can defeat `React.memo`. Mention that as a performance consideration.
- **Async callbacks:** `arr.map(async (x) => ...)` returns an array of promises. You need `Promise.all` to await them, plus a concurrency limit for large lists.
