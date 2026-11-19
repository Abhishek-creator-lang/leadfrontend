Implement `Array.prototype.myConcat(...items)`, a polyfill for the native [`Array.prototype.concat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat). It returns a **new** array made of `this` followed by each argument. Arguments that are arrays are spread one level deep. Any other value is appended as a single element.

The starter attaches the function to `Array.prototype` and default-exports it.

```js
[1, 2].myConcat([3, 4], 5); // [1, 2, 3, 4, 5]
[1].myConcat([[2]], 'ab'); // [1, [2], 'ab'] (only one level, strings are not spread)
[1, , 3].myConcat([4]); // [1, <hole>, 3, 4] (holes are kept)
const copy = [1, 2].myConcat(); // a new array, copy !== original
```

## Requirements

- Never mutate `this` or the arguments.
- Spread a value only if it is "concat-spreadable":
  - If the value is an object with a `Symbol.isConcatSpreadable` property that is not `undefined`, spread it when that property is truthy.
  - Otherwise, spread it only if `Array.isArray(value)` is true. Plain array-like objects such as `{ length: 2, 0: 'a', 1: 'b' }` are appended as-is.
- The same rule applies to `this`, so the receiver itself might be appended as one element.
- Preserve **holes**: if index `k` is missing from a spread source, the matching index is missing from the result too, and the result's `length` still accounts for it.
- Do not use the native `concat`, spread syntax on the sources, or `flat`.

## Follow-up

- How does `concat` differ from `[...a, ...b]`?
- Why might a library set `Symbol.isConcatSpreadable` on a custom collection class?
