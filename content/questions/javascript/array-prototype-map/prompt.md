Implement `Array.prototype.myMap(callbackFn, thisArg)`, a polyfill for the native [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map). It returns a new array of the same length where each element is the result of `callbackFn`.

The starter attaches the function to `Array.prototype` and default-exports it.

```js
[1, 2, 3].myMap((n) => n * 2); // [2, 4, 6]
['a', 'b'].myMap((ch, i) => ch + i); // ['a0', 'b1']

const scale = { factor: 10 };
[1, 2].myMap(function (n) {
  return n * this.factor;
}, scale); // [10, 20]

[1, , 3].myMap((n) => n * 2); // [2, <hole>, 6]
```

## Requirements

- Call `callbackFn(element, index, array)` in ascending index order, with `thisArg` as `this`.
- Throw a `TypeError` if `callbackFn` is not callable, before iterating.
- The result has the **same length** as the source. Holes are **not visited** and stay holes in the result (`1 in result` is `false` above).
- Read the length once. Elements appended during iteration are not visited. Elements deleted before they are reached become holes.
- Do not mutate the source. Do not use the native `map`, `forEach`, `reduce` or `Array.from` with a mapper.

## Follow-up

- Why does `['1', '2', '3'].map(parseInt)` return `[1, NaN, NaN]`?
- Why is `Array(3).map((_, i) => i)` not `[0, 1, 2]`, and how would you fix it?
