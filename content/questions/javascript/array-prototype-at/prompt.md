Implement `Array.prototype.myAt(index)`, a polyfill for the native [`Array.prototype.at`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at). It returns the element at `index`. A negative `index` counts back from the end of the array, so `-1` is the last element.

The starter file already attaches the function to `Array.prototype` and default-exports it. You only need to fill in the body.

```js
const letters = ['a', 'b', 'c', 'd'];

letters.myAt(0); // 'a'
letters.myAt(-1); // 'd'
letters.myAt(-4); // 'a'
letters.myAt(4); // undefined
letters.myAt(-5); // undefined
letters.myAt(1.8); // 'b' (fractions are truncated toward zero)
letters.myAt('2'); // 'c' (the index is converted to a number)
letters.myAt(); // 'a' (undefined -> NaN -> 0)
```

## Requirements

- Convert `index` the way the spec does: `Number(index)`, then `NaN` becomes `0`, then truncate toward zero.
- Return `undefined` when the resolved position is outside `[0, length)`.
- Do not use the native `at`.
- The method is generic: it must work when called on array-like objects and strings via `Array.prototype.myAt.call(...)`.
- Calling it with `this` set to `null` or `undefined` throws a `TypeError`.
- A hole in a sparse array reads as `undefined`, like any missing property.

## Follow-up

- Why was `at` added when `arr[arr.length - 1]` already works?
- Which other built-ins share the same "relative index" behaviour?
