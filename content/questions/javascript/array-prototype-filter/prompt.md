Implement `Array.prototype.myFilter(callbackFn, thisArg)`, a polyfill for the native [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter). It returns a new array with the elements for which `callbackFn` returns a truthy value.

The starter attaches the function to `Array.prototype` and default-exports it.

```js
[1, 2, 3, 4].myFilter((n) => n % 2 === 0); // [2, 4]
['a', '', 'b'].myFilter(Boolean); // ['a', 'b']

const limits = { max: 2 };
[1, 2, 3].myFilter(function (n) {
  return n <= this.max;
}, limits); // [1, 2]
```

## Requirements

- Call `callbackFn(element, index, array)` once per element, in ascending index order. `array` is the object `myFilter` was called on.
- Use `thisArg` as `this` inside `callbackFn`.
- Throw a `TypeError` if `callbackFn` is not a function. Do this **before** iterating, even for an empty array.
- **Skip holes** in sparse arrays: `callbackFn` is not called for missing indices.
- Read the length **once** at the start. Elements pushed during iteration are not visited. Elements deleted before they are reached are skipped.
- Return a new, dense array. Do not mutate the original.
- Do not use the native `filter`, `map`, `forEach` or `reduce`.

## Follow-up

- How would you write a version that removes items **in place**, and when would that be worth it?
- What does the native method do for subclasses of `Array`?
